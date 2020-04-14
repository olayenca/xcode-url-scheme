import inAppBrowser from 'react-native-inappbrowser-reborn';

const requests = async (type = 'GET', url = '', data = '') =>{
    const response = await fetch(url, {
        method: type,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: data,
    });
    return await response.json();
};

export default async function requestInstagram(
    apiUri,
    scheme,
) {
    const instagramTokens = {
        access_token: '',
        client_id: '550357975864603',
        client_secret: '433f38400b0cdf59e089c5e663632286',
        user_id: 0,
    };

    try {
        if (await inAppBrowser.isAvailable()) {
            const result = await inAppBrowser.openAuth(apiUri);

            let qr = {};
            result.url
                .substring(scheme?.length + 1)
                .split('&')
                .forEach(p => {
                    qr[p.split('=')[0]] = p.split('=')[1];
                });

            return requests(
                'POST',
                'https://api.instagram.com/oauth/access_token',
                `client_id=${instagramTokens.client_id}&client_secret=${instagramTokens.client_secret}&grant_type=authorization_code&redirect_uri=iosCallbacks.github.io&code=${
                    qr.code
                }`,
            ).then(second => {
                if (second.access_token.length > 0) {
                    const {user_id, access_token} = second;

                    return requests(
                        'GET',
                        `https://graph.instagram.com/${user_id}?fields=id,username&access_token=${access_token}`,
                        '',
                    );
                }
            });
        }
    } catch (e) {
        console.error(e);
    }
}