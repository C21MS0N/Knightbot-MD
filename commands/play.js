const yts = require('yt-search');
const axios = require('axios');

async function playCommand(sock, chatId, message) {
    try {
        const text = (
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            ""
        ).trim();

        const searchQuery = text.split(' ').slice(1).join(' ').trim();

        if (!searchQuery) {
            return await sock.sendMessage(chatId, {
                text: "❓ *What song do you want to download?*"
            });
        }

        // 🔍 Search for the song
        const { videos } = await yts(searchQuery);

        if (!videos || videos.length === 0) {
            return await sock.sendMessage(chatId, {
                text: "❌ *No songs found for:* " + searchQuery
            });
        }

        // Send loading message
        await sock.sendMessage(chatId, {
            text: "⏳ _Please wait, your download is in progress..._"
        });

        const video = videos[0];
        const videoUrl = video?.url;

        if (!videoUrl) {
            return await sock.sendMessage(chatId, {
                text: "❌ Failed to get video URL."
            });
        }

        // 🛰️ Fetch audio data from API
        const response = await axios.get(`https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(videoUrl)}`);

        const data = response.data;

        if (!data?.status || !data?.result?.downloadUrl) {
            return await sock.sendMessage(chatId, {
                text: "❌ Failed to fetch audio. Please try again later."
            });
        }

        const audioUrl = data.result.downloadUrl;
        const title = data.result.title || 'song';

        // 🎵 Send the audio file
        await sock.sendMessage(chatId, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`
        }, { quoted: message });

    } catch (error) {
        console.error('❗ Error in playCommand:', error);
        await sock.sendMessage(chatId, {
            text: "⚠️ Download failed. Please try again later."
        });
    }
}

module.exports = playCommand;

/*
  🔊 Powered by KNIGHT-BOT
  👑 Credits: Keith MD
*/