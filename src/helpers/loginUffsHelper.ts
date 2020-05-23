const request = require("request").defaults({ jar: true });

const cheerio = require("cheerio");

const requestPromise = async (args: any) =>
    new Promise(async (resolve, reject) => {
        request(args, (error: any, response: any) => {
            if (error) reject(error);

            try {
                response.data = JSON.parse(response.body);
                resolve(response);
            }
            catch {
                resolve(response);
            }
        });
    });


function getHeadersMoodle() {
    return {
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0',
        'Origin': 'https://moodle-academico.uffs.edu.br',
        'Upgrade-Insecure-Requests': '1',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.87 Safari/537.36',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-User': '?1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'Sec-Fetch-Site': 'same-origin',
        'Referer': 'https://moodle-academico.uffs.edu.br/login/index.php',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Encoding': 'gzip'
    };
}


const getSessKeyMoodle = (response: any) => {

    const sesskeyName = 'sesskey';

    const sesskeyIndex = response.indexOf(sesskeyName);

    // Rename the variables to a more meaningful name
    const aux = response.substring(sesskeyIndex - 1, sesskeyIndex + 200);
    const aux2 = aux.search(',');
    const infoAsString = aux.substring(0, aux2)

    const indexAux = infoAsString.indexOf(':"') + 1;

    const dataToLogout = infoAsString.substring(indexAux)

    return dataToLogout.replace(/[\"]/g, '')
}

const logoutMoodle = async (response: any) => {
    const headers = getHeadersMoodle();

    const sesskey = getSessKeyMoodle(response);

    const options = {
        url: 'https://moodle-academico.uffs.edu.br/login/logout.php?sesskey=' + sesskey,
        method: 'GET',
        headers: headers,
        gzip: true
    };

    return request(options);
};

const doLoginMoodle = async ({ username, password }: { username: string; password: string; }) => {
    const headers = getHeadersMoodle();

    const dataString = `username=${username}&password=${password}&anchor=`;

    const options = {
        url: 'https://moodle-academico.uffs.edu.br/login/index.php',
        method: 'POST',
        headers: headers,
        body: dataString,
        gzip: true
    };


    return await requestPromise(options);
}


const goToMoodleMainPage = async () => {
    const headers = getHeadersMoodle();

    const options = {
        url: 'https://moodle-academico.uffs.edu.br/my/',
        method: 'GET',
        headers: headers,
        gzip: true
    }

    return await requestPromise(options);
}


async function getUserPictureFromMoodle({ authenticator, password }: { authenticator: string; password: string; }) {
    const _ = await doLoginMoodle({ username: authenticator, password });
    const res = await goToMoodleMainPage() as { body: any, data: any };

    const $ = cheerio.load(res.body);

    const imgs = $(".userpicture");

    let i = 0;

    for (i = 0; i < imgs.length; i++) {
        if (imgs[i].attribs.src.startsWith("https://moodle-academico.uffs.edu.br/pluginfile.php/"))
            break;
    }

    if (i < imgs.length) {
        const img = imgs[i];
        const profilePicture = img.attribs.src.replace("/f2", "/f1");
        return profilePicture;
    }

    return null;
}

async function getUserInfo({ IdUFFS, token }: { IdUFFS: string; token: string; }) {
    const res = await requestPromise({
        // data: "{\"authId\":\"eyAidHlwIjogIkpXVCIsICJhbGciOiAiSFMyNTYiIH0.eyAib3RrIjogInJmc2o3c3NqamhrOXAwaG5mMjNpdjRxcTdvIiwgInJlYWxtIjogImRjPW9wZW5hbSxkYz1mb3JnZXJvY2ssZGM9b3JnIiwgInNlc3Npb25JZCI6ICJBUUlDNXdNMkxZNFNmY3lPWTN3aURPdzNiSkNLRmJka21JOFBaM0hVN0Z5QzRvZy4qQUFKVFNRQUNNREVBQWxOTEFCUXROamcxTmpVNU56WXlNall6TWpZMU56WXdPUUFDVXpFQUFBLi4qIiB9.gyV3J6K-gLZbh7SIYyqjDvI2v3p2HHcPTW-0uysSiAI\",\"template\":\"\",\"stage\":\"DataStore1\",\"header\":\"Entre com seu IdUFFS\",\"callbacks\":[{\"type\":\"NameCallback\",\"output\":[{\"name\":\"prompt\",\"value\":\"IdUFFS ou CPF\"}],\"input\":[{\"name\":\"IDToken1\",\"value\":\"41706303866\"}]},{\"type\":\"PasswordCallback\",\"output\":[{\"name\":\"prompt\",\"value\":\"Senha\"}],\"input\":[{\"name\":\"IDToken2\",\"value\":\"20042040\"}]}]}",
        url: `https://id.uffs.edu.br/id/json/users/${IdUFFS}?realm=/`,
        method: "GET",
        'headers': {
            'Cookie': makeCookie(token)
        },
    }) as { data: any };

    return { ...res.data };
}

async function getIdUFFS(token: string) {
    const options = {
        'method': 'POST',
        'url': 'https://id.uffs.edu.br/id/json/users?_action=idFromSession&realm=/',
        'headers': {
            'Cookie': [makeCookie(token), 'JSESSIONID=AC7F559BC6F5A11EDE14AC1138B9D9D0; amlbcookie=01']
        },
        body: "{\"_action\": \"idFromSession\",\n\"realm\": \"/\"}"
    };
    const res = await requestPromise(options) as { data: any };
    return { ...res.data };
}

function makeCookie(tokenId: string){
    return `iPlanetDirectoryPro=${tokenId}`;
}

async function getTokenFromStudentPortal({ authenticator, password }: { authenticator: string; password: string; }) {
    const options = {
        body: `{\"authId\":\"eyAidHlwIjogIkpXVCIsICJhbGciOiAiSFMyNTYiIH0.eyAib3RrIjogInJmc2o3c3NqamhrOXAwaG5mMjNpdjRxcTdvIiwgInJlYWxtIjogImRjPW9wZW5hbSxkYz1mb3JnZXJvY2ssZGM9b3JnIiwgInNlc3Npb25JZCI6ICJBUUlDNXdNMkxZNFNmY3lPWTN3aURPdzNiSkNLRmJka21JOFBaM0hVN0Z5QzRvZy4qQUFKVFNRQUNNREVBQWxOTEFCUXROamcxTmpVNU56WXlNall6TWpZMU56WXdPUUFDVXpFQUFBLi4qIiB9.gyV3J6K-gLZbh7SIYyqjDvI2v3p2HHcPTW-0uysSiAI\",\"template\":\"\",\"stage\":\"DataStore1\",\"header\":\"Entre com seu IdUFFS\",\"callbacks\":[{\"type\":\"NameCallback\",\"output\":[{\"name\":\"prompt\",\"value\":\"IdUFFS ou CPF\"}],\"input\":[{\"name\":\"IDToken1\",\"value\":\"${authenticator}\"}]},{\"type\":\"PasswordCallback\",\"output\":[{\"name\":\"prompt\",\"value\":\"Senha\"}],\"input\":[{\"name\":\"IDToken2\",\"value\":\"${password}\"}]}]}`,
        url: "https://id.uffs.edu.br/id/json/authenticate?realm=/",
        method: "POST",
        headers: {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-api-version": "protocol=1.0,resource=2.0",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/json",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-nosession": "true",
            "x-password": "anonymous",
            "x-requested-with": "XMLHttpRequest",
            "x-username": "anonymous",
            "mode": "cors",
            "credentials": "include",
            "referrer": "https://id.uffs.edu.br/id/XUI/",
            "referrerPolicy": "no-referrer-when-downgrade",
        },
    };

    const res = await requestPromise(options) as { data: any };

    return { ...res.data };
}


export {
    getTokenFromStudentPortal,
    getHeadersMoodle, 
    getIdUFFS, 
    getUserInfo,
    getUserPictureFromMoodle,
    goToMoodleMainPage,
    doLoginMoodle,
    logoutMoodle,
    getSessKeyMoodle,
};