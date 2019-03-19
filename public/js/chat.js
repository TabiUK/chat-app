"use strict";

const socket = io()

// DOM Elments
// form
const $messageForm = document.querySelector('#message-form')
const $messageFormInput =  $messageForm.querySelector('input')
const $messageFormButton =  $messageForm.querySelector('button')

// stand-a-lone
//const $messageSendInput = document.querySelector('#messageSendInput')
//const $messageSendButton = document.querySelector('#messageSendButton')

 //sendlocation
const $locationSendButton = document.querySelector('#send-location')

// div message
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


const autoscroll = () =>
{
    // New message element
    const $newMessage = $messages.lastElementChild

    // Get The Height of the new Message
    // creates the CSS information applyed to newMessage
    const newMessageStyles = getComputedStyle($newMessage)

    // extract the margin bottom so we can add it to the total height of the lastElement added
    const newMessageMarginBottom = parseInt(newMessageStyles.marginBottom)

    // total height of the last emelent added including the bottom margib
    const newMessageHeight = $newMessage.offsetHeight + newMessageMarginBottom

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of message container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled ?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('locationMessage', (data) =>
{
    console.log(data)

    const html = Mustache.render(locationTemplate, {
        username: data.username,
        url: data.message,
        createdAt: moment(data.createdAt).format("HH:mm:ss")
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('message', (data) =>
{
    console.log('message from server: ', data)

    const html = Mustache.render(messageTemplate, {
        username: data.username,
        message: data.text,
        createdAt: moment(data.createdAt).format("HH:mm:ss")
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    console.log(room)
    console.log(users)
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

// stand-a-lone
/*
$messageSendButton.addEventListener('click', () => {
        const text = $messageSendInput.value.trim()
        if (text === undefined || text === '') return
        $messageSendButton.setAttribute('disabled', 'disabled')
        $messageSendInput.setAttribute('disabled', 'disabled')
        $messageSendInput.value = ''

        socket.emit('sendMessage', text, (error) => {
            $messageSendButton.removeAttribute('disabled')
            $messageSendInput.removeAttribute('disabled')
            $messageSendInput.focus()

            if (error) {
                console.log('Error message response from server:', error)
            } else {
                console.log('Got message resonse from server')
            }
        })
    })
*/

// form
$messageForm.addEventListener('submit', (e) =>
{
    // stops form from really submitting
    e.preventDefault()

    //target is the form
    const text = e.target.elements.message.value.trim()
    if (text === undefined || text === '') return
    $messageFormButton.setAttribute('disabled', 'disabled')

    $messageFormInput.setAttribute('disabled', 'disabled')
    $messageFormInput.value = ''

    socket.emit('sendMessage', text, (error) =>
    {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.removeAttribute('disabled')
        $messageFormInput.focus()

        if (error) {
            console.log('Error message response from server:', error)
        } else {
            console.log('Got message resonse from server')
        }
    })
})

// get location
$locationSendButton.addEventListener('click', () =>
{
    if (!navigator.geolocation) return alert('geolocation is not supported by your browser')
    
    $locationSendButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => 
    {
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation', location, (error) =>
        {
            $locationSendButton.removeAttribute('disabled')

            if (error) {
                console.log('Error message response from server:', error)
            } else {
                console.log('Location shared!')
            }
        })

    }, () => 
    {
        alert('geolocation is not allowed by your browser/system')
    })
})

socket.emit('join', { username, room }, (error) =>
{
    if (error) {
        alert(error)
        location.href = "/"
    }
})