//Format

export class Transformer {
  protected capitalizeFirstLetter(str: string) {
      if (!str){
      return '-';
      }
      return str.charAt(0).toUpperCase() + str.slice(1);
  }

  listToString(list: [string]) {
    if(list){
      if (list.length < 1){
      return '-'
      }
      return list.join(', ')
    }
    return '-'
  }

  protected booleanToString(value: boolean){
      if(value){
          return 'True';
      }
      return 'False';
  }

  protected formatDate(dateObj: Date){
      if (!dateObj){
          return '-';
      }
      dateObj = new Date(dateObj);
      const year = dateObj.getFullYear();
      const month = ("0" + (dateObj.getMonth() + 1)).slice(-2)
      const day = ("0" + dateObj.getDate()).slice(-2)
      const hours = dateObj.getHours();
      const minutes = dateObj.getMinutes();
      const date = day + "/" + month + "/" + year;
      const time = hours + ":" + minutes;
      return date + " " + time;
  }

  protected defaultBehaviour(data,cb){
    if(data){
      if(data.data && data.data.length){
        return cb();
      }else{
        let tempArray = []
        return tempArray;
      }
    }else{
      let tempArray = []
        return tempArray;
    }
  }

  protected getStatus(data: {}){
    if(data['active']){
        return 'ACTIVE';
    }
    return 'INACTIVE';
  }

  protected defaultObjectBehaviour(data,cb){
    if(data){
      if(!this.isEmpty(data.data)){
        return cb();
      }else{
        let tempArray = []
        return tempArray;
      }
    }else{
      let tempArray = []
        return tempArray;
    }
  }

  protected isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
  }


  protected ObjectToArray(obj) {
    let tempArray=[];
    for (var p in obj) {
      if( obj.hasOwnProperty(p) ) {
        tempArray.push({key:p,value:obj[p]})
      }
    }
    return tempArray;
  }
}
