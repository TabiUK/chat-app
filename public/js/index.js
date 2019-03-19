"use strict";

const socket = io()

const messageFormInput = document.getElementById('roomname')
const roomselector = document.getElementById('roomselecter')


function onRoomSelect() {

    const value = document.getElementById("roomselect").value;
    if (value === "") {
        messageFormInput.required = true
        messageFormInput.disabled = false
        return
    }

    messageFormInput.required = false
    messageFormInput.disabled = true
}

// Templates
const roomTemplate = document.querySelector('#room-template').innerHTML

socket.emit('getroomlist', (roomlist) =>
{
    if (roomlist === undefined) return
    const rooms = roomlist[0]
    if (rooms === undefined) return
    
    const html = Mustache.render(roomTemplate, {
        roomlist
    })
    roomselector.innerHTML = html

})


socket.on('roomlistupdate', (data) =>
{
    if (data.text === undefined) {
        roomselector.innerHTML = ""
        return
    }

    const rooms = data.text[0]
    if (rooms === undefined) {
        roomselector.innerHTML = ""
        return
    }

    const html = Mustache.render(roomTemplate, {
        roomlist: data.text
    })
    roomselector.innerHTML = html
})
