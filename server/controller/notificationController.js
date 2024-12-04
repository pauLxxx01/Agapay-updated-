const axios = require('axios');

const sendPush = async (req, res) => {
    try {
        const response = await axios.post('https://exp.host/--/api/v2/push/send', req.body);
        res.status(200).send({
            success: true,
            message: "Push notification sent successfully",
            data: response.data
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error sending push notification",
            error: error
        });
    }
}

module.exports = {
    sendPush,
};