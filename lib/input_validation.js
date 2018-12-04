/**
 * Desc: Library of funtions for validating all manner of inputs for the pipeline front end
 *
 * Authors:
 *      - Chance Nelson <chance-nelson@nau.edu>
 */


String.prototype.isNumber = function(){return /^\d+$/.test(this);}


function parseTemperature(temperature) {
    /**
     * Desc: Parse a temperature value
     *
     * Args: 
     *      temperature (string/int)
     *
     * Returns:
     *      - "InvalidTemperature": temperature contains illegal characters
     *      - "IllegalTemperature": temperature is outside of the reasonable range
     *      - int: Parsed, legal temperature
     */
    if(!temperature.isNumber()) {
        throw "InvalidTemperature"
    }
    
    temperature = parseInt(temperature);

    if(temperature > 0 && temperature < 100) {
        return True;
    } else {
        throw "IllegalTemperature";
    }

    return temperature;
}


function parseRange(from, to) {
    /**
     * Desc: Parse a range of two numbers
     *
     * Args: 
     *      from (int)
     *      to (int)
     *
     * Returns:
     *      - "RangeFromInvalid" or "RangeToInvalid": Range identifier contains illegal chatacters
     *      - "RangeIllegal": Range results in a negative difference
     *      - [int, int]: Parsed, legal range
     */
    if(!from.isNumber()) {
        throw "RangeFromInvalid";
    }

    if(!to.isNumber()) {
        throw "RangeToInvalid";
    }

    to   = parseInt(to);
    from = parseInt(from);

    if(to - from < 0) {
        throw "RangeIllegal";
    }

    return [to, from];
}
