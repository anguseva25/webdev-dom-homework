//import { formatDate } from "./common.js"
import { format } from 'date-fns'

export const comments = {
    arrayUsers: [],

    changeLike(index) {
        const user = this.arrayUsers[index]
        if (user.validButtonLike) {
            user.likes--
            user.validButtonLike = false
        } else {
            user.likes++
            user.validButtonLike = true
        }
    },

    getReply(index) {
        const user = this.arrayUsers[index]

        return `> ${user.text.replaceAll("<br>", "\n")}\n\n${user.name}, `
    },

    getLinesUsers() {
        return this.arrayUsers
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
    },

    setDataFromServer(responseData) {
        this.arrayUsers = responseData.comments.map((comment) => {
            return {
                name: comment.author.name,
                // dateOfComment: dateInComment(comment.date),
                //dateOfComment: formatDate(new Date(comment.date)),
                dateOfComment: format(new Date(comment.date), 'yyyy-MM-dd HH.mm.ss'),
                text: comment.text,
                likes: comment.likes,
                validButtonLike: false,
            }
        })
    },
}
