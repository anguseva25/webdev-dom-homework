export function getComments() {
    return fetch("https://wedev-api.sky.pro/api/v1/anka-anny/comments", {
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

export function postComment( { text, nameText }) {
    return fetch("https://wedev-api.sky.pro/api/v1/anka-anny/comments", {
        method: "POST",
        body: JSON.stringify({
          text: text.trim().safeCode(),
          name: nameText.trim().safeCode(),
          forceError: true,
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
}