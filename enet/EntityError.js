function EntityError(id, message) {
    this.id = id;
    this.message = message;
}

// #import modules
try {
    module.exports = EntityError;
} catch(e) {}
// import modules#