"use strict";
import {name, token, getAuthorization, getComments, postComment} from "./api.js"
import {formatDate} from "./common.js"

const mainDiv = document.querySelector(".main")

let buttonElement
let nameInputElement
let textInputElement
let listElement

// загрузочная Ракета-анимация (основная)
const preloader = document.getElementById("preloader")
// загрузочная Ракета-анимация (дополнительная)
let secondPreloader

// массив данных с каждым пользователем
let arrayUsers = [];

const likeButton = () => {
    const likeButtonElements = document.querySelectorAll(".like-button");
    for (let likeButtonElement of likeButtonElements)
        likeButtonElement.addEventListener("click", (event) => {
            const index = likeButtonElement.dataset.index
            const user = arrayUsers[index]
            if (user.validButtonLike) {
                user.likes--;
                user.validButtonLike = false;
            } else {
                user.likes++;
                user.validButtonLike = true;
            }

            render()
            event.stopPropagation()
        });
};

// добавление комментария
const commentAdd = () => {
    const comments = document.querySelectorAll(".comment");
    for (let comment of comments)
        comment.addEventListener("click", (event) => {
            const user = arrayUsers[comment.dataset.index];
            textInputElement.value = `> ${user.text.replaceAll(
                "<br>",
                "\n"
            )}\n\n${user.name}, `;
            event.stopPropagation();
        });
}

const render = (forComments = true) => {
    let linesHTML

    if (forComments) {
        const comments = getLinesUsers()
        linesHTML = [`<ul id="list-comments" class="comments">`, ...comments, `</ul>`]

        if (token) {
            linesHTML.push(`<div class="preloaderNew hide" id="preloaderNew">
                  <span class="loaderNew"></span>
                </div>`)
            linesHTML.push(`<div class="add-form">
                    <input type="text" id="name-input" class="add-form-name" placeholder="Введите ваше имя" value="${name}" disabled>
                    <textarea id="text-input" class="add-form-text" placeholder="Введите ваш коментарий" rows="4"></textarea>
                    <div class="add-form-row">
                        <button id="add-button" class="add-form-button">Написать</button>
                    </div>
                </div>`)
        } else {
            linesHTML.push(`<p class="ask-login">Чтобы отправлять сообщения, перейдите на <a href="#" id="authorization">авторизацию</a></p>`)
        }
    } else {
        linesHTML = [`<div class="sign-form">
            <input type="text" id="login-input" class="sign-form-login" placeholder="Введите ваш логин" value="">
            <input type="password" id="password-input" class="sign-form-password" placeholder="Введите ваш пароль" value="">
            <div class="sign-form-row">
                <button id="sign-button" class="sign-form-button">Авторизоваться</button>
            </div>
        </div>`]
        linesHTML.push(`<p class="ask-login">Закрыть форму авторизации, <a href="#" id="authorization">перейти к комментариям</a></p>`)
    }

    mainDiv.innerHTML = linesHTML.join("");

    const linkAuthorization = document.getElementById('authorization')

    if (linkAuthorization)
        linkAuthorization.addEventListener("click", () => render(!forComments))

    secondPreloader = document.querySelector('.preloaderNew')
    listElement = document.getElementById("list-comments")

    if (token) {
        buttonElement = document.getElementById("add-button")

        buttonSendClick()
        likeButton()
    }
    else {
        buttonElement = document.getElementById("sign-button")

        buttonAuthorizeClick()
    }

    //
    // if (buttonElement.disabled) {
    //     buttonElement.disabled = false;
    //     buttonElement.textContent = "Написать";
    // }
}

// render- функция (форма нового комментария)
function getLinesUsers(){
    return arrayUsers
        // const userHtml = arrayUsers
        .map((user, index) => {
            const likeStatus = user.validButtonLike ? "-active-like" : ""
            const dataIndex = `data-index="${index}"`

            return `<li class="comment" ${dataIndex}>
                <div class="comment-header">
                    <div>${user.name}</div>
                    <div>${user.dateOfComment}</div>
                </div>
                <div class="comment-body">
                    <div class="comment-text" ${dataIndex}>
                        ${user.text}
                    </div>
                </div>
                <div class="comment-footer">
                    <div class="likes">
                        <span class="likes-counter">${user.likes}</span>
                        <button class="like-button ${likeStatus}" ${dataIndex}></button>
                    </div>
                </div>
              </li>`
    })
}

window.addEventListener("load", function () {
    preloader.classList.remove('hide');

    if (preloader.classList.contains('hide'))
        secondPreloader.classList.remove('hide')
});

//API домашка

// METHOD " GET "

function fetchPromiseArr() {
    getComments().then((responseData) => {
        arrayUsers = responseData.comments.map((comment) => {
            return {
                name: comment.author.name,
                // dateOfComment: dateInComment(comment.date),
                dateOfComment: formatDate(new Date(comment.date)),
                text: comment.text,
                likes: comment.likes,
                validButtonLike: false,
            };
        });
        preloader.classList.add('hide');
        if (secondPreloader)
            secondPreloader.classList.add('hide');
        render()
    })
        .catch((error) => {
            if (error.message === "Failed to fetch")
                alert("сломался интернет!");
            else
                alert(error.message);

            preloader.classList.add("hide");
        });
}

fetchPromiseArr();

// METHOD " POST "
function postPromise() {
    postComment({
        text: textInputElement.value,
        nameText: nameInputElement.value
    }).then(() => {
        textInputElement.value = "";
        fetchPromiseArr();
    })
        .catch((error) => {
            if (error.message === "Failed to fetch")
                alert("сломался интернет!");
            else
                alert(error.message);

            buttonElement.disabled = false;
            buttonElement.textContent = "Написать"

            preloader.classList.add("hide");

            // return back previous comments
            render()
        });
}

// Нажатие кнопки авторизации

function buttonAuthorizeClick() {
    if (!buttonElement)
        return

    const loginInputElement = document.getElementById("login-input")
    const passwordInputElement = document.getElementById("password-input")

    if (!loginInputElement || !passwordInputElement)
        return

    buttonElement.addEventListener("click", () => {
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

        buttonElement.disabled = true
        buttonElement.textContent = "Подождите..."

        preloader.classList.remove("hide")

        getAuthorization(loginInputElement.value, passwordInputElement.value)
            .then((result) => {
                preloader.classList.add("hide")

                if (result === "Ok") {
                    render()
                } else {
                    passwordInputElement.value = ""

                    buttonElement.disabled = false
                    buttonElement.textContent = "Авторизоваться"
                }
            })
    })
}

// Работа кнопки при нажатии (поле Имя и поле текст)

function buttonSendClick() {
    if (!buttonElement)
        return

    nameInputElement = document.getElementById("name-input")
    textInputElement = document.getElementById("text-input")

    if (!nameInputElement || !textInputElement)
        return

    buttonElement.addEventListener("click", () => {
        // в случае пустого поля в графе Имя
        nameInputElement.classList.remove("error");

        if (nameInputElement.value.trim() === "") {
            nameInputElement.classList.add("error");
            return;
        }

        // в случае пустого поля в графе Текст
        textInputElement.classList.remove("error");

        if (textInputElement.value.trim() === "") {
            textInputElement.classList.add("error");
            return;
        }

        listElement.innerHTML = ""

        buttonElement.disabled = true;
        buttonElement.textContent = "Элемент добавляется...";
        preloader.classList.remove("hide");

        postPromise();
    })
}
