Retorna todas as monitorias

### GET /assistance
### GET /assistance/{id}




#### GET /assistance

Possíveis parametros
{
    avaliable: boolean,
    offset: number,
    limit: number 
}

Exemplo:
GET /assistance?avaliable=true

Retorno:

``` json
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


#### GET /assistance/{id}

Exemplo: 

GET /assistance/5

Retorno: Os mesmos campos que /assistance