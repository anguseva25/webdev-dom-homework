import {comments} from "./comments.js";
import {API} from "./api.js";

export const DOM = {
    mainDiv: document.querySelector(".main"),

    buttonElement: undefined,
    nameInputElement: undefined,
    textInputElement: undefined,
    listElement: undefined,

    // загрузочная Ракета-анимация (основная)
    preloader: document.getElementById("preloader"),
    // загрузочная Ракета-анимация (дополнительная)
    secondPreloader: undefined,

    state: {
        // loadingFirst: true, // => rocket
        waitingAuthor: true, // => last line with request to authorize + w/o add-form
        singingAuthor: false, // => authorization form
        sendingNew: false, // => second rocket + w/o add-form
    },

    /* listeners */

    likeButton() {
        const elements = document.querySelectorAll(".like-button");
        for (let element of elements) {
            element.addEventListener("click", (event) => {
                comments.changeLike(element.dataset.index)

                this.state.singingAuthor = false
                this.render()
                event.stopPropagation()
            });
        }
    },

    commentAdd() {
        const elements = document.querySelectorAll(".comment");
        for (let element of elements)
            element.addEventListener("click", (event) => {
                // const user = arrayUsers[element.dataset.index];
                // textInputElement.value = `> ${user.text.replaceAll(
                //     "<br>",
                //     "\n"
                // )}\n\n${user.name}, `;

                this.textInputElement.value = comments.getReply(element.dataset.index)
                event.stopPropagation()
            })
    },

    buttonAuthorizeClick() {
        if (!this.buttonElement)
            return

        const loginInputElement = document.getElementById("login-input")
        const passwordInputElement = document.getElementById("password-input")

        if (!loginInputElement || !passwordInputElement)
            return

        this.buttonElement.addEventListener("click", () => {
            // в случае пустого поля в графе login
            loginInputElement.classList.remove("error");

            if (loginInputElement.value.trim() === "") {
                loginInputElement.classList.add("error");
                return;
            }

            // в случае пустого поля в графе password
            passwordInputElement.classList.remove("error");

            if (passwordInputElement.value.trim() === "") {
                passwordInputElement.classList.add("error");
                return;
            }

            this.buttonElement.disabled = true
            this.buttonElement.textContent = "Подождите..."

            this.preloader.classList.remove("hide")

            API.getAuthorization(loginInputElement.value, passwordInputElement.value)
                .then((result) => {
                    this.preloader.classList.add("hide")

                    if (result === "Ok") {
                        this.state.waitingAuthor = false
                        this.state.singingAuthor = false
                        this.render()
                    } else {
                        passwordInputElement.value = ""

                        this.buttonElement.disabled = false
                        this.buttonElement.textContent = "Авторизоваться"
                    }
                })
        })
    },

    buttonSendClick() {
        if (!this.buttonElement)
            return

        this.nameInputElement = document.getElementById("name-input")
        this.textInputElement = document.getElementById("text-input")

        if (!this.nameInputElement || !this.textInputElement)
            return

        this.buttonElement.addEventListener("click", () => {
            // в случае пустого поля в графе Имя
            this.nameInputElement.classList.remove("error");

            if (this.nameInputElement.value.trim() === "") {
                this.nameInputElement.classList.add("error");
                return;
            }

            // в случае пустого поля в графе Текст
            this.textInputElement.classList.remove("error");

            if (this.textInputElement.value.trim() === "") {
                this.textInputElement.classList.add("error");
                return;
            }

            // this.listElement.innerHTML = ""
            //
            // this.buttonElement.disabled = true;
            // this.buttonElement.textContent = "Элемент добавляется...";
            this.preloader.classList.remove("hide");

            this.state.sendingNew = true
            this.render()

            this.postPromise();
        })
    },

    /* work with API */

    fetchPromiseArr() {
        API.getComments()
            .then((responseData) => {
                comments.setDataFromServer(responseData)
                // arrayUsers = responseData.comments.map((comment) => {
                //     return {
                //         name: comment.author.name,
                //         // dateOfComment: dateInComment(comment.date),
                //         dateOfComment: formatDate(new Date(comment.date)),
                //         text: comment.text,
                //         likes: comment.likes,
                //         validButtonLike: false,
                //     };
                // });
                this.preloader.classList.add('hide');
                // if (secondPreloader)
                //     secondPreloader.classList.add('hide');

                this.state.singingAuthor = false
                this.state.sendingNew = false
                this.render()
            })
            .catch((error) => {
                if (error.message === "Failed to fetch")
                    alert("сломался интернет!");
                else
                    alert(error.message);

                this.preloader.classList.add("hide");
            });
    },

    postPromise() {
        API.postComment({
            text: this.textInputElement.value,
            nameText: this.nameInputElement.value,
        })
            .then(() => {
                //textInputElement.value = "";
                this.fetchPromiseArr();
            })
            .catch((error) => {
                if (error.message === "Failed to fetch")
                    alert("сломался интернет!");
                else
                    alert(error.message);

                if (this.buttonElement) {
                    this.buttonElement.disabled = false;
                    this.buttonElement.textContent = "Написать"
                }

                this.preloader.classList.add("hide");

                // return back previous comments
                this.state.sendingNew = false
                this.render(this.textInputElement.value)
            });
    },

    /* render */

    render(userComment = "") {
        let linesHTML

        // if (this.state.loadingFirst) {
        //     linesHTML.push(`<div class="preloader hide" id="preloader">
        //         <span class="loader"></span>
        //     </div>`)
        // }
        if (this.state.singingAuthor) {
            linesHTML = [`<div class="sign-form">
                <input type="text" id="login-input" class="sign-form-login" placeholder="Введите ваш логин" value="">
                <input type="password" id="password-input" class="sign-form-password" placeholder="Введите ваш пароль" value="">
                <div class="sign-form-row">
                    <button id="sign-button" class="sign-form-button">Авторизоваться</button>
                </div>
            </div>`]
            linesHTML.push(`<p class="ask-login">Закрыть форму авторизации, <a href="#" id="authorization">перейти к комментариям</a></p>`)
        } else {
            const commentLines = comments.getLinesUsers()
            linesHTML = [`<ul id="list-comments" class="comments">`, ...commentLines, `</ul>`]

            if (this.state.waitingAuthor) {
                linesHTML.push(`<p class="ask-login">Чтобы отправлять сообщения, перейдите на <a href="#" id="authorization">авторизацию</a></p>`)
            } else if (this.state.sendingNew) {
                linesHTML.push(`<div class="preloaderNew" id="preloaderNew">
                  <span class="loaderNew"></span>
                </div>`)
            } else {
                linesHTML.push(`<div class="add-form">
                    <input type="text" id="name-input" class="add-form-name" placeholder="Введите ваше имя" value="${API.name}" disabled>
                    <textarea id="text-input" class="add-form-text" placeholder="Введите ваш коментарий" rows="4">${userComment}</textarea>
                    <div class="add-form-row">
                        <button id="add-button" class="add-form-button">Написать</button>
                    </div>
                </div>`)
            }
        }

        this.mainDiv.innerHTML = linesHTML.join("");
        this.commentAdd();
        const linkAuthorization = document.getElementById('authorization')

        if (linkAuthorization) {
            linkAuthorization.addEventListener("click", () => {
                if (this.state.singingAuthor)
                    this.state.singingAuthor = false
                else
                    this.state.singingAuthor = true
                this.render()
            })
        }

        this.secondPreloader = document.querySelector('.preloaderNew')
        this.listElement = document.getElementById("list-comments")

        if (this.state.singingAuthor) {
            this.buttonElement = document.getElementById("sign-button")

            this.buttonAuthorizeClick()
        } else {
            this.buttonElement = document.getElementById("add-button")

            this.buttonSendClick()
            this.likeButton()
        }

        //
        // if (this.buttonElement.disabled) {
        //     this.buttonElement.disabled = false;
        //     this.buttonElement.textContent = "Написать";
        // }
    },

    /* main function */

    start() {
        window.addEventListener("load", function () {
            this.preloader.classList.remove('hide');

            if (this.preloader.classList.contains('hide'))
                this.secondPreloader.classList.remove('hide')
        })

        //this.render()
        this.fetchPromiseArr()
    },
}
