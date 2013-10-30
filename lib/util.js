module.exports = {

    /**
     * Returns whether x is a valid slug (contains only letters, digits and dashes)
     */
    validSlug: function(x) {
        return !x.match(/[^a-zA-Z0-9-]/);
    }

}
