// const safeCode = (string) => { используем прототипы, чтобы сразу смочь преобразовать строку из trim()
String.prototype.safeCode = function () {
    return this
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
};

export const formatDate = (date) => {
    const getNum = (value) => value < 10 ? "0" + value : value;

    const nowDate = getNum(date.getDate())
    const month = getNum(date.getMonth() + 1)
    const minutes = getNum(date.getMinutes())

    return nowDate +
        "." +
        month +
        "." +
        (date.getFullYear() % 100) +
        " " +
        date.getHours() +
        ":" +
        minutes;
}