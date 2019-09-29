# eslint-plugin-lodash-to-native
Плагин для ESLint, отслеживающий использование lodash.map

## Использование
1. Установить пакет: ```npm install https://github.com/alexkale/eslint-plugin-lodash-to-native.git```  
2. **.eslintrc.js**:  
```js
"plugins": [
    "lodash-to-native"
  ],
  "rules": {
    "lodash-to-native/map": "warn"
},
```
3. Тесты: ```npm run test```

## Возможности
1. Фикс правила добавляет проверку аргумента на массив и вызывает нативную реализацию Array.map
для массивов;
2. В случае, если аргумент – явно заданный массив, заменяет без проверки на массив;
3. Если аргумент – функция, заменяет на вариант с проверкой, используя IIFE для кэширования;
4. Если аргумент - явно заданный объект, правило не срабатывает;
