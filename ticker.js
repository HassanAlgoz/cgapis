module.exports = {
    tick(label) {
        let t0 = Infinity;
        t0 = (new Date()).getTime();
        process.stdout.write(`"${label}..."\r`);
        return {
            tock() {
                const delta = (new Date()).getTime() - t0;
                t0 = Infinity;
                process.stdout.write(`"${label}" took ${delta.toFixed(0)}ms`);
                console.log();

            },
        };
    },
};