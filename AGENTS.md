# GuiaQuem - Especificação Funcional

## Objetivo

O GuiaQuem é uma aplicação web para gerenciamento e publicação de diretórios institucionais de pessoas.

O sistema consome dados de uma API externa e permite que gestores reorganizem livremente pessoas, departamentos e setores para produzir um catálogo institucional personalizado.

O catálogo deve ser disponibilizado tanto em uma interface web pública quanto em documentos PDF com layout moderno e adequado para divulgação interna.

---

# Arquivos de Referência

A pasta `docs/` contém materiais de referência para o desenvolvimento:

* Exemplo de resposta JSON contendo funcionários.
* Exemplo de resposta JSON contendo docentes.
* Exemplo de PDF utilizado atualmente para publicação.

Esses arquivos devem ser utilizados para compreender a estrutura dos dados de entrada e o formato esperado da saída.

---

# Tecnologias Obrigatórias

* Frontend: Next.js
* Backend: Next.js (App Router)
* Banco de dados: MariaDB
* ORM: Preferencialmente Prisma
* Autenticação administrativa: Login e senha
* Geração de PDF: Implementação server-side

---

# Perfis de Usuário

## Usuário Público

Pode:

* Visualizar o catálogo publicado.
* Pesquisar pessoas.
* Filtrar por departamento, setor ou categoria.
* Baixar o catálogo em PDF.

Não pode:

* Alterar qualquer dado.

---

## Gestor

Pode:

* Acessar painel administrativo protegido por login e senha.
* Configurar integração com a API.
* Sincronizar dados.
* Criar pessoas manualmente.
* Editar pessoas.
* Ocultar pessoas.
* Excluir pessoas.
* Criar departamentos.
* Criar setores.
* Reorganizar pessoas.
* Gerar PDFs.

---

# Integração com API

O sistema consome uma API externa autenticada.

As seguintes configurações devem ser editáveis pelo painel administrativo:

* URL da API
* Usuário
* Senha

A sincronização pode ser executada manualmente pelo gestor e a cada sincronização a data e horário devem ser registradas e disponibilizadas na interface do gestor.

Futuramente poderá existir sincronização automática.

---

# Estrutura dos Dados Importados

A API retorna pessoas da organização.

Exemplo:

```json
{
  "id": "234-83c-734-435-534",
  "codlog": "zuleika",
  "sala": "120A",
  "email": "zuleika@ime.usp.br",
  "fone": "(11)3091-2222",
  "nome": "Zuleika Abranches",
  "funcao": "Secretária",
  "designacao": "Chefe de Seção III",
  "setor": "Diretoria",
  "curriculo_lang": "",
  "sdgs": [],
  "exibir": true
}
```

A API classifica as pessoas em:

* Docentes organizados por departamento.
* Funcionários organizados por setor.

---

# Fonte da Verdade

A API é a fonte da verdade apenas para os dados cadastrais da pessoa.

Exemplos:

* Nome
* E-mail
* Telefone
* Sala
* Função
* Designação

O GuiaQuem é a fonte da verdade para a organização interna do catálogo.

Exemplos:

* Departamentos criados localmente.
* Setores criados localmente.
* Categorias personalizadas.
* Ordenação das pessoas.
* Pessoas ocultas.
* Pessoas criadas manualmente.

---

# Reorganização de Pessoas

O principal objetivo do sistema é permitir que o gestor reorganize livremente as pessoas.

O gestor deve poder:

* Criar departamentos.
* Criar setores.
* Criar categorias.
* Renomear departamentos.
* Renomear setores.
* Renomear categorias.
* Excluir departamentos.
* Excluir setores.
* Excluir categorias.

A interface deve possuir recursos modernos de drag-and-drop.

Exemplos:

* Arrastar uma pessoa para outro setor.
* Arrastar uma pessoa para outro departamento.
* Reordenar pessoas dentro de um grupo.
* Mover múltiplas pessoas.

A organização realizada pelo gestor nunca deve ser sobrescrita por uma sincronização da API.

---

# Pessoas Criadas Manualmente

O gestor pode criar pessoas manualmente.

Essas pessoas não possuem vínculo com a API.

O sistema deve identificá-las visualmente como:

"Pessoa Local"

Essas pessoas nunca devem ser modificadas durante sincronizações.

---

# Pessoas Importadas da API

Pessoas importadas da API devem possuir vínculo permanente com o identificador externo.

Exemplo:

```text
origem = API
id_externo = 234-83c-734-435-534
```

Durante sincronizações:

* Atualizar dados cadastrais.
* Manter organização local.
* Manter categorias locais.
* Manter ordenação local.
* Manter ocultações.

---

# Pessoas Removidas da API

Quando uma pessoa deixar de existir na API:

* Não remover automaticamente.
* Marcar como "Não encontrada na API".
* Exibir alerta ao gestor.

O gestor poderá:

* Manter a pessoa.
* Excluir a pessoa.

---

# Exclusão e Soft Delete

Nenhuma exclusão deve ser física.

Toda exclusão deve utilizar soft delete.

Exemplo:

```text
deleted_at
```

Quando uma pessoa for excluída:

* Não deve aparecer no catálogo.
* Não deve aparecer nas buscas.
* Não deve reaparecer em futuras sincronizações mesmo que volte a existir na API.

Essa regra evita que exclusões deliberadas do gestor sejam revertidas.

---

# Ocultação

Uma pessoa pode ser marcada como oculta.

Pessoas ocultas:

* Não aparecem no catálogo público.
* Não aparecem no PDF.
* Continuam existindo no sistema administrativo.

---

# Catálogo Público

A área pública deve oferecer:

* Busca textual.
* Filtro por nome.
* Filtro por departamento.
* Filtro por setor.
* Filtro por categoria.
* Visualização responsiva.
* Layout moderno.

---

# Geração de PDF

O sistema deve gerar PDFs institucionais com layout moderno.

Requisitos:

* Cabeçalho institucional.
* Sumário opcional.
* Agrupamento por departamentos ou setores.
* Paginação.
* Índice opcional.
* Boa impressão em papel A4.
* Boa visualização digital.

O PDF deve respeitar exatamente a organização configurada pelo gestor.

---

# Auditoria

Registrar:

* Sincronizações executadas.
* Pessoas criadas.
* Pessoas editadas.
* Pessoas excluídas.
* Alterações de organização.


---
# Criação do Usuário Administrador Inicial

O sistema deve suportar a criação automática do primeiro usuário administrador durante a instalação.

## Configuração

As seguintes variáveis de ambiente devem ser suportadas:

```env
ADMIN_NAME=Administrador
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=senha-inicial
```

## Comportamento

Durante a inicialização da aplicação ou execução do seed:

1. Verificar se já existe algum usuário com perfil `ADMIN`.
2. Caso exista pelo menos um administrador, nenhuma ação deve ser realizada.
3. Caso não exista nenhum administrador, criar automaticamente o usuário administrador utilizando os dados fornecidos pelas variáveis de ambiente.
4. A senha deve ser armazenada utilizando hash seguro (bcrypt ou argon2).
5. O usuário criado automaticamente deve possuir perfil `ADMIN`.

## Requisitos

* A operação deve ser idempotente.
* Não deve criar administradores duplicados.
* Alterações posteriores nas variáveis de ambiente não devem modificar administradores já existentes.
* A criação automática deve ocorrer apenas quando não existir nenhum administrador cadastrado.

## Objetivo

Permitir que novas instalações do GuiaQuem possuam um usuário administrativo inicial sem necessidade de manipulação direta do banco de dados.

# Estratégia Recomendada

Implementar a criação do administrador inicial através de um seed Prisma.

Não utilizar credenciais fixas no código-fonte.

Todas as credenciais iniciais devem ser obtidas exclusivamente das variáveis de ambiente.

Exemplo:

```env
ADMIN_NAME=Administrador
ADMIN_EMAIL=admin@local
ADMIN_PASSWORD=trocar-esta-senha
```
---




# Funcionalidades Futuras Desejáveis

* Importação por CSV.
* Exportação para CSV.
* Histórico de versões do catálogo.
* Múltiplos catálogos publicados.
* Agendamento automático de sincronização.
* Upload de fotografia das pessoas.
* QR Code para versão online do catálogo.
* Temas visuais para PDF.
* Permissões com múltiplos gestores.
* Dashboard com estatísticas.
* Backup e restauração.
* API própria do GuiaQuem.
