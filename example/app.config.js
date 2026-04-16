module.exports = ({ config }) => ({
    ...config,
    plugins: [
        [
            require.resolve("../app.plugin"),
            {
                ios: {
                    appKey: process.env.TUYA_IOS_APP_KEY || "YOUR_IOS_APP_KEY",
                    appSecret: process.env.TUYA_IOS_APP_SECRET || "YOUR_IOS_APP_SECRET",
                },
                android: {
                    appKey: process.env.TUYA_ANDROID_APP_KEY || "YOUR_ANDROID_APP_KEY",
                    appSecret: process.env.TUYA_ANDROID_APP_SECRET || "YOUR_ANDROID_APP_SECRET",
                },
            },
        ],
    ],
});
