"use strict";
import {getComments, postComment} from "./api.js"
import {formatDate} from "./common.js"

const buttonElement = document.getElementById("add-button");
const listElement = document.getElementById("list-comments");
const nameInputElement = document.getElementById("name-input");
const textInputElement = document.getElementById("text-input");
const commentsElement = document.getElementById("comments");

// массив данных c каждым пользователем
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

            renderUsers();
            event.stopPropagation();
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
};

// render- функция (форма нового комментария)
const renderUsers = () => {
    listElement.innerHTML = arrayUsers
        // const userHtml = arrayUsers
        .map((user, index) => {
            return `<li class="comment" data-index= '${index}'>
        <div class="comment-header">
          <div>${user.name}</div>
          <div>${user.dateOfComment}</div>
        </div>
        <div class="comment-body">
          <div class="comment-text" data-index= '${index}'>
            ${user.text}
          </div>
        </div>
        <div class="comment-footer">
          <div class="likes">
            <span class="likes-counter">${user.likes}</span>
            <button data-index= '${index}' class="like-button ${
                user.validButtonLike ? "-active-like" : ""
            }"></button>
          </div>
        </div>
      </li>`;
        })
        .join("");
    // listElement.innerHTML = userHtml;
    likeButton();
    commentAdd();
    if (buttonElement.disabled) {
        buttonElement.disabled = false;
        buttonElement.textContent = "Написать";
    }
};

renderUsers();

// загрузочная Ракета-анимация (основная)
const preloader = document.getElementById("preloader");
// загрузочная Ракета-анимация (дополнительная)
const secondPreloader = document.querySelector('.preloaderNew');

window.addEventListener("load", function () {
    preloader.classList.remove('hide');

    if (preloader.classList.contains('hide'))
        secondPreloader.classList.remove('hide')
});

//API домашка

// METHOD " GET "

function fetchPromiceArr() {
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
        secondPreloader.classList.add('hide');
        renderUsers();
    })
        .catch((error) => {
            if (error.message === "Failed to fetch")
                alert("сломался интернет!");
            else
                alert(error.message);

            preloader.classList.add("hide");
        });
}

fetchPromiceArr();

// METHOD " POST "
function postPromise() {
    postComment({
        text: textInputElement.value,
        nameText: nameInputElement.value
    }).then(() => {
        nameInputElement.value = "";
        textInputElement.value = "";
        fetchPromiceArr();
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
            renderUsers()
        });
}

// Работа кнопки при нажатии (поле Имя и поле текст)
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

});