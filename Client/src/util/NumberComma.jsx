const formatNumberWithCommas = (input, decimals = 2) => {
    const numericString = input.toString().match(/-?\d+(\.\d+)?/);

    if (!numericString) {
        throw new TypeError("Input is not a valid number");
    }

    let number = parseFloat(numericString[0]);

    if (decimals < 0) {
        const factor = Math.pow(10, -decimals);
        number = Math.round(number / factor) * factor;
    }

    return number.toFixed(Math.max(0, decimals)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default formatNumberWithCommas;
