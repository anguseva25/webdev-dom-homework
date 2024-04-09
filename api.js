export let name = ''
export let token = ''
const host = 'https://wedev-api.sky.pro/api/user/login'

export function getComments() {
    return fetch("https://wedev-api.sky.pro/api/v2/anka-anny/comments", {
        method: "GET",
    })
        .then((response) => {
            if (response.status === 400)
                throw new Error("слишком короткий запрос. Укажи больше 3 символов");
            if (response.status === 500) throw new Error("ошибка на сервере");
            if (response.status === 200)
                return response.json();
        });
}

export function getAuthorization(login, password) {
    return fetch(host, {
        method: "POST",
        body: JSON.stringify({
            login: login,
            password: password,
        }),
    })
        .then((response) => {
            if (response.status === 400)
                // throw new Error("слишком короткий запрос. Укажи больше 3 символов");
                return response.json();
            if (response.status === 500)
                // throw new Error("ошибка на сервере");
                return response.json();
            if (response.status === 201)
                return response.json();
        })
        .then((data) => {
            if (data.error)
                return alert(data.error)

            name = data.user.name
            token = `Bearer ${data.user.token}`
            return "Ok"
        })
}


export function postComment({text, nameText}) {
    return fetch("https://wedev-api.sky.pro/api/v2/anka-anny/comments", {
        method: "POST",
        headers: {
            Authorization: token,
        },
        body: JSON.stringify({
            text: text.trim().safeCode(),
            //name: nameText.trim().safeCode(),
            //forceError: true,
        }),
    })
        .then((response) => {
            if (response.status === 400)
                throw new Error("слишком короткий запрос. Укажи больше 3 символов");
            if (response.status === 500) throw new Error("ошибка на сервере");
            if (response.status === 201) {
                return response.json();
            }
        })
        // .then(() => {
        //   text.value = "";
        // })
}