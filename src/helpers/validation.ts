interface ValidationFields {
    type?: string,
    len?: number,
    mustHas?: string,
    data: string | number,
    message?: string
}


function multiValidate(objs: ValidationFields[]) {
    const response = [] as { message: string }[];
    objs.forEach(validation => {
        const res = validate(validation);

        if (res === false)
            response.push({
                message: validation.message ? validation.message : "Unknow field incomplete",
            })
    });

    return response;
}

function validate({ data, type, len, mustHas, message }: ValidationFields) {
    if (type === "cpf") {
        return cpfValidator(data as string)
    }
    if (type === "name") {
        const string = String(data);
        return nameValidator(string, mustHas, len);
    }
    if (type === "password") {
        return passwordValidator(String(data));
    }
    if (type === "email")
        return emailValidator(String(data));
}

function emailValidator(email: string) {
    if (email.search(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/) === -1)
        return false;

    return true
}

function passwordValidator(password: string) {
    // need to have numbers and numbers and at least one special character
    // "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"

    if (password.search(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/) === -1)
        return false;

    return true
}


function nameValidator(string: string, mustHas?: string, len?: number) {
    if (mustHas) {
        if (string.search(mustHas) < 0) return false
    }

    if (len && string.length < len)
        return false;

    if (string.search(/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]+$/) === -1)
        return false;

    return true;
}

function cpfValidator(cpf: string) {

    let sum = 0;
    let remain;
    let verifier = true;

    [0, 9].forEach(letter => {
        verifier = verifier && verifySameLetter(String(letter), cpf);
    });

    function verifySameLetter(letter: string, cpf: string) {
        if (letter.repeat(11) === cpf)
            return false;

        return true;
    }

    if (!verifier) return false;

    for (let i = 1; i <= 9; i++) {
        sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    remain = sum % 11;

    if (remain === 10 || remain === 11 || remain < 2) {
        remain = 0;
    } else {
        remain = 11 - remain;
    }

    if (remain !== Number(cpf.substring(9, 10)))
        return false;

    sum = 0;

    for (let i = 1; i <= 10; i++)
        sum = sum + Number(cpf.substring(i - 1, i)) * (12 - i);

    remain = sum % 11;

    if (remain === 10 || remain === 11 || remain < 2)
        remain = 0;
    else
        remain = 11 - remain;


    if (remain !== Number(cpf.substring(10, 11)))
        return false;

    return true;
}

export { validate, nameValidator, cpfValidator, emailValidator, passwordValidator, multiValidate };