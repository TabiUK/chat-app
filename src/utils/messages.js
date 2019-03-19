const generateMesage = (username, text) =>
{
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMesage = (username, url) =>
{
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}


module.exports = {
    generateMesage,
    generateLocationMesage
}