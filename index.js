const customer_id = new Date().getTime()+'';
const form = document.querySelector('form');

const formEvent = form.addEventListener('submit', event => {
    event.preventDefault();

    const youtube_url = document.querySelector('#youtube').value;
    const keywords = document.querySelector('#keywords').value;

    const email = 'famesorter@gmail.com';

    const payload = {
        Data: {
            "Keyword": keywords,
            "Email": email,
            "CustomerId": customer_id
        },
        "PartitionKey": "1"
    };
    searchKeyWords(payload);
});

const searchKeyWords = (keywords) => {
    axios.put('https://r8y325hxrj.execute-api.ap-southeast-2.amazonaws.com/prod/streams/requestStream/record', keywords)
        .then(response => {
            console.log('Keywords Submitted');
            poll(() => {
                return axios.get('https://2cdaff1xc7.execute-api.ap-southeast-2.amazonaws.com/prod/id/'+customer_id);
            }, 16000, 1000)
                .then(res => {
                    document.querySelector('#results').textContent = res.Items[0].Data.S; 
                }).catch(() => console.log('failed to get result'));

        })
        .catch(error => console.error(error));
};

const poll = (fn, timeout, interval) => {
    const endTime = Number(new Date()) + timeout;
    const condition = (resolve, reject) => {
        let ajax = fn();
        ajax.then(response => {
            if (response.status === 200 && response.data.Count>0) {
                resolve(response.data);
            } else if (Number(new Date()) < endTime) {
                setTimeout(condition, interval, resolve, reject);
            } else {
                reject(new Error('timed out'));
            }
        });
    };
    return new Promise(condition);
}
