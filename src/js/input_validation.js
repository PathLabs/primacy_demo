/**
 * Desc: Library of funtions for validating all manner of inputs for the pipeline front end
 *
 * Authors:
 *      - Chance Nelson <chance-nelson@nau.edu>
 */


exports.parseTemperature = function(temperature) {
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
    String.prototype.isNumber = function(){return /^\d+$/.test(this);};

    if(!temperature.isNumber()) {
        throw "InvalidTemperature";
    }

    temperature = parseInt(temperature);

    if(temperature > 0 && temperature < 100) {
        return temperature;
    } else {
        throw "IllegalTemperature";
    }

    return temperature;
}


exports.parseRange = function(from, to) {
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
    String.prototype.isNumber = function(){return /^\d+$/.test(this);};

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


exports.validateFasta = function(fasta_seq) {
    /**
     * Desc: Validate a FASTA sequence.
     *
     * Args:
     *      fasta_seq (string): raw fasta string
     *
     * Returns:
     *      True, if sequence is valid.
     *      False, else.
     *
     * Notes:
     *      Allowed characters:
     *          A, C, T, G, M, R, W, S, Y, K, V, H, D, B, N, X
     *
     *      If '>' is encountered, it is treated as a header, and the rest of
     *      that line is ignored during validation.
     */
    fasta_seq = fasta_seq.split('\n');

    const legal_char_set = ['A', 'C', 'T', 'G', 'M', 'R', 'W', 'S', 
                            'Y', 'K', 'V', 'H', 'D', 'B', 'N', 'X'];

    for(i = 0; i < fasta_seq.length; i++) {
        for(j = 0; j < fasta_seq[i].length; j++) {
            let curr_char = fasta_seq[i][j];
           
            // Is the character in the legal set?
            if(legal_char_set.indexOf(curr_char) > -1) {
                continue;

            // Is this a header?
            } else if(i == 0 && j == 0 && curr_char == '>') {
                break;

            // Else, not legal
            } else {
                return false;
            }
        }
    }

    return true;
}
