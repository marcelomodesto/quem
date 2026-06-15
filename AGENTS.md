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

# Organização do Catálogo

O principal objetivo do GuiaQuem é permitir que o gestor organize livremente as pessoas em uma estrutura hierárquica de catálogo, independentemente da organização original fornecida pela API.

A API é responsável apenas por fornecer os dados cadastrais das pessoas e sua classificação de origem. A organização utilizada para publicação no GuiaQuem é mantida exclusivamente pelo sistema.

## Conceito de Grupo

O GuiaQuem utiliza o conceito de Grupo de Catálogo.

Um grupo representa qualquer tipo de agrupamento utilizado para organizar pessoas.

Exemplos:

* Administração
* Ensino
* Pesquisa
* Matemática
* Computação
* Recursos Humanos
* Informática

O sistema não deve diferenciar departamentos, setores, seções ou categorias. Todos esses conceitos devem ser representados por grupos.

## Hierarquia de Grupos

Um grupo pode possuir um grupo pai.

A estrutura deve suportar múltiplos níveis hierárquicos.

Exemplo:

```text
Administração
├── Recursos Humanos
├── Financeiro
└── Informática

Ensino
├── Matemática
└── Computação
```

A profundidade da hierarquia não deve ser limitada pela regra de negócio.

# Organização do Catálogo

## Objetivo

A interface administrativa de organização do catálogo deve permitir que o gestor organize livremente pessoas e grupos, independentemente da estrutura original fornecida pela API.

A solução deve ser eficiente para cenários contendo centenas ou milhares de pessoas.

A API é responsável apenas por fornecer os dados cadastrais das pessoas e sua classificação de origem. A estrutura de publicação do GuiaQuem é mantida exclusivamente pelo sistema.

---

## Conceito de Grupo

O GuiaQuem utiliza o conceito de Grupo de Catálogo.

Um grupo representa qualquer agrupamento utilizado para organizar pessoas.

Exemplos:

* Administração
* Ensino
* Pesquisa
* Matemática
* Computação
* Recursos Humanos
* Informática

O sistema não deve diferenciar departamentos, setores, seções ou categorias. Todos esses conceitos devem ser representados por grupos.

---

## Hierarquia de Grupos

Um grupo pode possuir um grupo pai.

A estrutura deve suportar múltiplos níveis hierárquicos.

Exemplo:

```text
Administração
├── Recursos Humanos
├── Financeiro
└── Informática

Ensino
├── Matemática
└── Computação
```

A profundidade da hierarquia não deve ser limitada pela regra de negócio.

---

## Estrutura da Interface

A tela de organização deve ser dividida em dois painéis independentes.

### Painel de Grupos

Exibe a árvore hierárquica dos grupos.

Características:

* Exibição em árvore.
* Expansão e recolhimento de grupos.
* Busca de grupos.
* Rolagem independente.
* Alteração de hierarquia.
* Alteração de ordem.
* Criação e edição de grupos.

### Painel de Pessoas

Exibe as pessoas pertencentes ao grupo atualmente selecionado.

Características:

* Rolagem independente.
* Busca instantânea.
* Paginação ou virtualização.
* Seleção individual.
* Seleção múltipla.
* Seleção em massa.
* Exibição rápida das informações principais.

---

## Gerenciamento de Grupos

O gestor deve poder:

* Criar grupos.
* Renomear grupos.
* Excluir grupos.
* Ocultar grupos.
* Alterar a posição dos grupos.
* Alterar a hierarquia dos grupos.

A exclusão de um grupo não deve excluir automaticamente as pessoas associadas a ele.

Antes da exclusão, o sistema deve permitir:

* Mover as pessoas para outro grupo.
* Remover a associação das pessoas ao grupo.
* Cancelar a operação.

Caso existam pessoas associadas ao grupo, o sistema deve solicitar confirmação explícita antes da exclusão.

---

## Associação de Pessoas

As pessoas são associadas aos grupos do catálogo.

A associação utilizada para publicação é independente da classificação original fornecida pela API.

O sistema deve permitir:

* Associar pessoas a grupos.
* Remover pessoas de grupos.
* Mover pessoas entre grupos.
* Reordenar pessoas dentro de um grupo.
* Ocultar pessoas.
* Selecionar múltiplas pessoas simultaneamente.
* Excluir pessoas
* Restaurar pessoas excluídas

---

## Pesquisa

A pesquisa de pessoas deve ser instantânea.

Deve permitir localizar pessoas por:

* Nome
* E-mail
* Telefone
* Sala
* Função

A filtragem deve ocorrer sem recarregar a página.

---

## Seleção em Massa

O sistema deve permitir:

* Selecionar uma pessoa.
* Selecionar múltiplas pessoas.
* Selecionar todas as pessoas visíveis.
* Selecionar todas as pessoas retornadas por uma pesquisa.

Exemplo:

```text
Pesquisar: Silva

Resultado: 27 pessoas

☑ Selecionar todas
```

---

## Movimentação de Pessoas

A movimentação principal de pessoas deve ocorrer por ações em lote.

Fluxo recomendado:

```text
Selecionar pessoas
↓
Mover para...
↓
Selecionar grupo destino
↓
Confirmar
```

Essa abordagem deve ser considerada o fluxo principal para movimentação de pessoas.

---

## Drag and Drop

A interface administrativa deve oferecer recursos modernos de drag-and-drop.

O recurso deve ser utilizado principalmente para operações de organização visual e reordenação.

Exemplos:

* Arrastar uma pessoa para outro grupo.
* Arrastar uma pessoa para um subgrupo.
* Reordenar pessoas dentro do mesmo grupo.
* Arrastar grupos para alterar a hierarquia.
* Arrastar grupos para alterar a ordem de exibição.

O sistema pode permitir movimentação de múltiplas pessoas selecionadas através de drag-and-drop, porém esse não deve ser o fluxo principal para operações em larga escala.

Para grandes volumes de dados, ações em lote devem ser priorizadas.

---

## Ordem de Exibição

Todos os grupos devem possuir uma ordem configurável.

Todas as pessoas dentro de um grupo devem possuir uma ordem configurável.

A ordem definida pelo gestor deve ser utilizada:

* Na interface pública.
* Na geração do PDF.
* Em exportações futuras.

---

## Performance

A interface deve permanecer responsiva mesmo com grandes volumes de dados.

Requisitos:

* Suporte a centenas ou milhares de pessoas.
* Virtualização de listas quando necessário.
* Carregamento incremental.
* Atualizações sem recarregamento completo da página.

---

## Responsividade

A interface deve funcionar em:

* Desktop.
* Tablets.

A versão desktop deve ser considerada prioritária, pois trata-se de uma ferramenta administrativa utilizada para operações de organização em larga escala.

---

## Objetivo de UX

O sistema deve minimizar a quantidade de operações necessárias para reorganizar o catálogo.

Operações em lote devem ser priorizadas em relação à movimentação individual.

A organização de centenas de pessoas deve ser possível com poucos cliques e sem exigir ações repetitivas.

A interface deve proporcionar uma experiência semelhante à de sistemas modernos de gerenciamento de conteúdo e diretórios corporativos.


## Sincronização com a API

A sincronização da API nunca deve sobrescrever a organização do catálogo.

Durante uma sincronização, o sistema pode atualizar apenas os dados cadastrais das pessoas, tais como:

* Nome
* E-mail
* Telefone
* Sala
* Função
* Designação

A sincronização não pode alterar:

* Grupos criados pelo gestor.
* Hierarquia dos grupos.
* Ordem dos grupos.
* Associação entre pessoas e grupos.
* Ordem das pessoas.
* Pessoas ocultas.

A organização definida pelo gestor é a fonte de verdade para a publicação do catálogo.


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
* Deve aparecer apenas em um painel a parte para que possa ser restaurada.

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

# Configuração das Credenciais da API

O GuiaQuem consome uma API externa protegida por autenticação.

As credenciais da API devem poder ser configuradas tanto por variáveis de ambiente quanto pela interface administrativa do sistema.

## Objetivo

Permitir que o sistema funcione imediatamente após a instalação utilizando variáveis de ambiente e, posteriormente, possibilitar que o administrador altere as configurações sem necessidade de acesso ao servidor.

## Campos de Configuração

O sistema deve suportar os seguintes parâmetros:

* URL base da API
* Usuário da API
* Senha da API

Exemplo:

```env
API_URL=https://api.exemplo.org
API_USER=usuario
API_PASSWORD=senha
```

## Fontes de Configuração

As credenciais podem existir em duas fontes:

1. Variáveis de ambiente (.env)
2. Banco de dados

## Regra de Precedência

A fonte de dados prioritária deve ser o banco de dados.

As regras de resolução devem ser:

### Cenário 1

Credenciais presentes apenas no arquivo `.env`.

Resultado:

* Utilizar as credenciais do `.env`.

### Cenário 2

Credenciais presentes no banco de dados.

Resultado:

* Utilizar as credenciais armazenadas no banco de dados.
* Ignorar os valores do `.env`.

### Cenário 3

Credenciais ausentes no banco de dados e ausentes no `.env`.

Resultado:

* Considerar a integração não configurada.
* Exibir mensagem apropriada para o administrador.
* Impedir a execução da sincronização.

## Interface Administrativa

O administrador deve possuir uma tela para:

* Visualizar a configuração atual.
* Cadastrar credenciais.
* Editar credenciais.
* Remover credenciais.
* Testar a conexão com a API.
* Visualizar o resultado do teste de conexão.

## Comportamento ao Salvar

Quando o administrador salvar novas credenciais:

* Os valores devem ser armazenados no banco de dados.
* As novas credenciais passam a ser a configuração ativa do sistema.
* As credenciais do banco passam a ter prioridade sobre as variáveis de ambiente.

## Comportamento ao Excluir

Quando o administrador excluir as credenciais armazenadas no banco:

* O sistema deve voltar a utilizar as variáveis de ambiente, caso existam.
* Caso não existam credenciais no `.env`, a integração deve ser considerada não configurada.

## Segurança

A senha da API não deve ser exibida em texto aberto após o salvamento.

A senha deve ser armazenada de forma segura utilizando mecanismo de criptografia apropriado para dados que precisam ser recuperados posteriormente.

Não utilizar hash irreversível (bcrypt ou equivalente) para a senha da API, pois a senha precisa ser recuperada para autenticação junto ao serviço externo.

## Requisitos Técnicos

A resolução das credenciais deve ser centralizada em um único serviço ou função.

Toda comunicação com a API deve utilizar exclusivamente as credenciais resolvidas por esse mecanismo.

Nenhum componente da aplicação deve acessar diretamente variáveis de ambiente ou registros de configuração sem utilizar o serviço de resolução de credenciais.

## Fluxo de Resolução

```text
Banco de Dados possui credenciais?
│
├─ Sim
│   └─ Utilizar credenciais do banco
│
└─ Não
    │
    ├─ .env possui credenciais?
    │   └─ Utilizar credenciais do .env
    │
    └─ Não
        └─ Integração não configurada
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
