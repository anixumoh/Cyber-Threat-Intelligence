import { Pipe, PipeTransform } from '@angular/core';


export function getKey(dic: any, key: string, def?: any): any {
  var listKeys = key.split('.')
  var value = dic;
  while (listKeys.length>0){
    var firstKey = listKeys.shift();
    var newValue = value[firstKey];
    if (!newValue){
      return def;
    }
    value = newValue;
  }
  return value;
}
@Pipe({
  name: 'getKey'
})
export class GetKeyPipe implements PipeTransform {

  transform(value: any, key: string, def?: any): any {
    return getKey(value, key, def)
  }

}
