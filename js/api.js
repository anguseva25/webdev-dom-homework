
export const API = {
    name: '',
    token: '',
    hostComments: 'https://wedev-api.sky.pro/api/v2/anka-anny/comments',
    hostAuthorization: 'https://wedev-api.sky.pro/api/user/login',

    getComments() {
        return fetch(this.hostComments, {
            method: "GET",
        })
            .then((response) => {
                if (response.status === 400)
                    throw new Error("слишком короткий запрос. Укажи больше 3 символов");
                if (response.status === 500) throw new Error("ошибка на сервере");
                if (response.status === 200)
                    return response.json();
            });
    },

    getAuthorization(login, password) {
        return fetch(this.hostAuthorization, {
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

                this.name = data.user.name
                this.token = `Bearer ${data.user.token}`
                return "Ok"
            })
    },

    postComment({text, nameText}) {
        return fetch(this.hostComments, {
            method: "POST",
            headers: {
                Authorization: this.token,
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
                if (response.status === 500)
                    throw new Error("ошибка на сервере");
                if (response.status === 201) {
                    return response.json();
                }
            })
    },
}
