export interface ValidationFields {
  type?: string;
  len?: number;
  mustHas?: string;
  data: string | number;
  message?: string;
}


function multiValidate(obj: ValidationFields[]) {
  const response = [] as { message: string }[];
  for (const validation of obj) {
    if(validation.data === undefined)
      continue;

    const res = validate(validation);

    if (res !== true)
      response.push(res);
  }

  return response;
}

function validate({ data, type, len, mustHas, message }: ValidationFields) {
  // const defaultMessage = "Unknown field incomplete";
  if (data === undefined)
    return {
      message: message ? message : "Unknown field incomplete"
    };

  if (type === "cpf") {
    if (cpfValidator(data as string) === true)
      return true;
  }
  if (type === "name") {
    const str = String(data);

    if (nameValidator(str, mustHas, len) === true)
      return true;
  }
  if (type === "password") {
    if (passwordValidator(String(data)) === true)
      return true;
  }
  if (type === "email") {

    if (emailValidator(String(data)) === true)
      return true;
  }

  if (type === "not-empty") {
    if (!(data === undefined || data === null || data === ""))
      return true;
  }

  if (type === "number") {
    if (!isNaN(Number(data)))
      return true;
  }

  if(type) {
    if(type.search("len=") >= 0) {
      const lenToCompare = parseInt(type.split("=")[1], 10);

      if(data.toString().length >= lenToCompare)
        return true;
    }
  }

  return {
    message: message ? message : "Unknown field incomplete"
  };

}

function emailValidator(email: string) {
  if (email.search(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/) === -1)
    return false;

  return true;
}

function passwordValidator(password: string) {
  const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})");

  if (password.length > 3)
    return true;

    return false;

}


function nameValidator(str: string, mustHas?: string, len?: number) {
  if (mustHas) {
    if (str.search(mustHas) < 0) return false;
  }

  if (len && str.length < len)
    return false;

  if (str.search(/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]+$/) === -1)
    return false;

  return true;
}

function cpfValidator(cpf: string) {
  let sum = 0;
  let leftOver;

  if (cpf === "00000000000") return false;

  for (let i = 1; i <= 9; i++)
    sum += parseInt(cpf.substring(i - 1, i), 10) * (11 - i);

  leftOver = (sum * 10) % 11;

  if ((leftOver === 10) || (leftOver === 11)) leftOver = 0;

  if (leftOver !== parseInt(cpf.substring(9, 10), 10)) return false;

  sum = 0;

  for (let i = 1; i <= 10; i++)
    sum += parseInt(cpf.substring(i - 1, i), 10) * (12 - i);

  leftOver = (sum * 10) % 11;

  if ((leftOver === 10) || (leftOver === 11)) leftOver = 0;

  if (leftOver !== parseInt(cpf.substring(10, 11), 10)) return false;

  return true;
}

export { validate, nameValidator, cpfValidator, emailValidator, passwordValidator, multiValidate };