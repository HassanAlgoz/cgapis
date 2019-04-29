module.exports = {
    tick(label) {
        let t0 = Infinity;
        t0 = (new Date()).getTime();
        console.log(`"${label}..."\r`);
        return {
            tock() {
                const delta = (new Date()).getTime() - t0;
                t0 = Infinity;
                console.log(`"${label}" took ${delta.toFixed(0)}ms`);

            },
        };
    },
};