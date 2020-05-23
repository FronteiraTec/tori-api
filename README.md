<p align="center">
    <img width="400" height="200" src="https://raw.githubusercontent.com/ccuffs/template/master/.github/logo.png" title="Logo do projeto"><br />
    <img src="https://img.shields.io/maintenance/yes/2020?style=for-the-badge" title="Status do projeto">
    <img src="https://img.shields.io/github/workflow/status/ccuffs/template/ci.uffs.cc?label=Build&logo=github&logoColor=white&style=for-the-badge" title="Status do build">
</p>

- [Projeto](#projeto)
- [Features](#features)
- [Começando](#come%c3%a7ando)
- [Instalação Comum](#instala%c3%a7%c3%a3o-comum)
  - [Configuração](#configura%c3%a7%c3%a3o)
  - [Iniciando o projeto](#iniciando-o-projeto)
  - [Script do banco](#script-do-banco)
- [Utilizando o docker](#utilizando-o-docker)
  - [Iniciando os containers](#iniciando-os-containers)
  - [O banco](#o-banco)
  - [Encerrando o docker](#encerrando-o-docker)
  - [Php myadmin](#php-myadmin)
- [Endpoints](#endpoints)



# Monitoria voluntária - Backend <!-- omit in toc -->

## Projeto
Este repositório refere-se ao backend do aplicativo de monitorias criado pela fronteira tec. 
É possível encontrar o repositório do aplicativo [aqui]().

> **IMPORTANTE:** Executar apenas este repositório lhe dara acesso a uma API e não ao aplicativo.

## Features

As principais features do projeto são:

* Criação de novos usuários;
* Login utilizando o idUFFS;
* Gerenciar monitorias;
* Inscrever-se como monitor;
* Inscrever-se em uma monitoria;
* Gerenciar usuário

## Começando
Caso tenha interesse em rodar localmente o projeto, siga os passos abaixo. A maneira mais simples é utizando o docker.



## Instalação Comum 

Instale o Yarn ou npm em seu computador, após isso utilize:

``` bash
    yarn install
    ## ou 
    npm i
```


### Configuração

Altere o arquivo [development.env](env/development.env) preenchendo as variáveis de acordo com sua configuração local do mariadb.

### Iniciando o projeto

Para rodar o programa em modo de desenvolvimento use:

``` bash 
    yarn start:dev
    ## ou
    npm run start:dev
```


Dê preferencia ao yarn caso possua ambos ou caso venha a ter que instalar um dos dois.

PS: O banco de dados também deve ser instalado

### Script do banco

Pode-se encontrar o plugin de instalação do banco de dados em [db.sql](util/db.sql).  
Juntamente com o banco existe um arquivo com dados fictícios que podem ser utuilizados para desenvolvimento em [dummyData.sql](util/dummyData.sql).  

## Utilizando o docker

Tenha certeza de que o docker esta instalado e rodando, assim como o docker-compose.

### Iniciando os containers

Utilize:

``` bash
    docker-compose up ## adicione -d caso queira rodar em segundo plano
    ## ou 
    npm run dup
```

**Importante**:  
Na primeira inicialização o container do mariadb pode demorar um pouco para completar a inicialização. Durante este processo, mesmo que o servidor esteja funcionando, não sera possível acessar o banco.

### O banco

Por padrão, o usuário do banco de dados e a senha são:  
user: root  
password: 123  


### Encerrando o docker

Caso iniciado com a flag -d pode-se encerrar o container utilizando:

``` bash
    docker-compose down 
    ## ou 
    npm run ddown
```

### Php myadmin

Uma das imagens contidas neste repositório é a do phpmyadmin, podendo acessar o mesmo clicando [aqui](http://localhost)
ou acessando:  
http://localhost


## Endpoints

Por padrão, a porta utilizada no projeto é a 3000, mas pode ser alterada em [development.env](env/development.env)

Ou seja, acessar a api requer:

http://localhost:3000



Lista dos endpoints:  
- [Monitorias](docs/assistances.md)