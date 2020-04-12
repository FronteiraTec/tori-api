Retorna todas as monitorias

## [GET /assistance](#get-assistance-1)
## [GET /assistance/search](#get-assistancesearch-1)



## Documentação:


### GET /assistance

Possíveis parametros
{
    avaliable: boolean,
    offset: number,
    limit: number 
}

Exemplo:
GET /assistance?avaliable=true

Retorno:

``` ts
{
  assistance: {
    id: int,
    title: string,
    description: string,
    avalible: boolean,
    total_vacancies: int,
    avalible_vacancies: int,
    date: DateTime,
    subjectName: string,
    course: {
      id: int,
      name: string,
      description: string,
    },
    owner: {
      id: int,
      fullName: string,
      createdAt: DateTime,
      stars: float,
      email: string,
      verifiedAssistant: boolean,
      course: {
        id: int,
        name: string,
        description: string,
      }
    },

    address: {
      id: int,
      cep: string,
      street: string,
      number: string,
      complement: string,
      reference: string,
      nickname: string,
      latitude: float,
      logintude: float
    }
}
```

### GET /assistance/search

### Possíveis argumentos. q e data são obrigatórios
/assistance/search?\
{q}&\
{data}&\
{limit}&\
{offset}&\
{filter}&\
{filterData}&\
{orderBy}&\
{orderByData}&\
{avaliable}\

#### q Possíveis argumentos:
q = id, name, tag, all\
data = "id", "nome", "tagNome", "texto a ser pesquisado"\
\
q e data são utilizados em conjunto.

#### limit e offset:
limit: number\
offset: number\
\
limit e offset são utilizados em conjunto.\

#### filter Possíveis argumentos:
filter = course-id, course-name\
filterData = "courseID", "courseName"\
\
filter e filterData são utilizados em conjunto.\
\
#### orderBY Possíveis argumentos:
orderBy = created_at, id, date\
orderByData = DESC, ASC\
orderBy e orderByData são utilizados em conjunto.\
\
\
#### avaliable Possíveis argumentos:
avaliable = true, 1\

### Exemplo:
assistance/search?q=id&data=5&limit=1&offset=0&filter=course-id&filterData=6&orderBy=id&orderByData=desc&avaliable=1
