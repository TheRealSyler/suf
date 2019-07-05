export declare namespace Random {
    /**
     * Gets a random string with the given length, if length is undefined the length will be 7.
     * @param length maximum possible Number.
     */
    function String(length?: number): string;
    /**
     * Gets a random integer within the given Range, if max is undefined max will be 10000.
     * @param max maximum possible Number.
     */
    function IntNumber(max?: number): number;
    /**
     * Generate a random object.
     * @param keyNum number of items in the object.
     * @param itemContent an array that defines the content of each item.
     * @param itemType the type of the item.
     */
    function Object(keyNum?: number, itemType?: IType, customItem?: any, itemContent?: IRandomItem[], options?: {
        keyLength: number;
        useIndexAsKey: boolean;
        randomStringLength: number;
        randomNumberLength: number;
    }): {
        [x: string]: any;
    };
    /**
     * Generate a random array.
     * @param arrayLength length of the generated array.
     * @param itemContent an array that defines the content of each item.
     * @param itemType the type of the item.
     */
    function Array(arrayLength?: number, itemType?: IType, customItem?: any, itemContent?: IRandomItem[], options?: {
        keyLength: number;
        randomStringLength: number;
        randomNumberLength: number;
    }): any[];
}
declare type IType = 'string' | 'number' | 'array' | 'custom' | 'customArray';
declare type IRandomItem = ['randomString' | 'literal' | 'randomNumber' | 'ascending', string?];
export {};