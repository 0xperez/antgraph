class GNode {

    constructor(label){

        this.label = label;
        this.id = undefined;
        this.isGoal = false;
        this.isStart = false;
    }

// USE OBJECT DEFINE PROPERTY TO SET RULES FOR THIS ******** ID PLEASE
// So that property cannot be assigned w/o enforcing some rules, because rename()
// does not protect against misuses (node.id = somewrongval is still possible)

/**
 * Generates a unique id code (wrt the application's domain) based on a timestamp and a random number.
 * @returns a string representing an id
 */

    generateId(){
        if (!Date.now) {
            Date.now = function() { return new Date().getTime(); }
        }
        return "" + Math.round(Math.random() * Date.now());
    }


}