const rooms = []

const findRoom = (roomToFind) => rooms.findIndex((room) => (room.room === roomToFind))

const addRoom = (roomToAdd) =>
{
    roomToAdd = roomToAdd.trim().toLowerCase()

    if (!roomToAdd) return rooms

    const index = findRoom(roomToAdd)

    if (index !== -1) 
    {
        rooms[index].users++
        return rooms
    }

    const toAddRoom = { room: roomToAdd, users: 1 }

    rooms.push(toAddRoom)
    return rooms
}

const getRooms = () => 
{
    return rooms
}

const UpdateDeleteRoom = (roomToUpdateDelete) =>
{
    if (!roomToUpdateDelete) return rooms

    const index = findRoom(roomToUpdateDelete)

    if (index === -1) return rooms

    if (rooms[index].users > 0) rooms[index].users--
    if (rooms[index].users <= 0) rooms.splice(index, 1)[0]

    return rooms
}


module.exports = {
    UpdateDeleteRoom,
    getRooms,
    addRoom
}