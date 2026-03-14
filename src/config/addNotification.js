export default function addNotification(toUsername, notification) {

if (!toUsername) return;

const data =
JSON.parse(localStorage.getItem("versusly_notifications") || "{}");

if (!data[toUsername]) {
data[toUsername] = [];
}

const newNotification = {
type: notification.type || "info",
from: notification.from || "Usuario",
avatar: notification.avatar || null,
avatarColor: notification.avatarColor || "#1d9bf0",
postId: notification.postId || null,
read: false,
date: Date.now()
};

// evitar duplicados recientes (opcional)
const alreadyExists = data[toUsername].some(
(n) =>
n.type === newNotification.type &&
n.from === newNotification.from &&
Date.now() - n.date < 2000
);

if (!alreadyExists) {
data[toUsername].unshift(newNotification);
}

localStorage.setItem(
"versusly_notifications",
JSON.stringify(data)
);

}
