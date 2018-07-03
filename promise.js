const request = require('request');
const fs = require('fs');

const getDataPromise = (url) => {
    const GITHUB_TOKEN = 'f5b6a9c5747ed5d155ec5273a2d2d34771b80374';
    const options = {
        uri: url,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
            'Authorization': `token ${GITHUB_TOKEN}`
        }
    }

    return new Promise(function(resolve, reject) {
        request.get(options, (err, response) => {
            if (err) {
                reject(err)
            } else {
                const data = JSON.parse(response.body);
                resolve(data)
            }
        })
    })
};

const writeToFile = (filename, obj) => {
    return new Promise(function(resolve, reject) {
        fs.writeFile(`./${filename}.json`, JSON.stringify(obj), (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(obj)
            }
        });
    })
}


const getGithubProfilePromise = (account, cb) => {
    getDataPromise(`https://api.github.com/users/${account}`)
        .then(user => {

            const { name, company, avatar_url, followers_url } = user
            let obj = {};
            Object.assign(obj, {
                name,
                company,
                avatar_url,
                followers_url
            });

            return obj;
        })
        .then(obj => {
            console.log(obj);
            getDataPromise(obj.followers_url)
                .then(followers => {
                    obj.followers = followers;
                    return obj;
                })

            .then(obj => {
                getDataPromise(`https://api.github.com/users/${account}/following`)
                    .then(following => {
                        obj.following = following;
                        return obj;
                    })

                .then(obj => {
                    getDataPromise(`https://api.github.com/users/${account}/starred`)
                        .then(starred => {
                            obj.starred = starred;
                            return obj;
                        })

                    .then(obj => {
                        delete obj['followers_url'];
                        writeToFile(account, obj)
                            .then(data => {
                                cb(data);
                            }, err => {
                                cb(err);
                            })
                    })
                })
            })
        })
}

getGithubProfilePromise('vophihungvn', (err, data) => {
    console.log(err, data)
})