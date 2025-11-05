class ChessHelper {


    static checkForRepetitions(repetetionTable){
        var dict = {}
        for (let value of repetetionTable){
            if (value in dict){
                dict[value] += 1
                if (dict[value] == 3) return true
            }
            else {
                dict[value] = 1
            }
        }
        return false
        
    }
    
}