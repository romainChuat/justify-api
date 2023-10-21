import { createToken } from '../src/app';


describe('test app file', () => { 

    /**
     * Test function createToken
     */
    
    test ('test createToken empty email', () => {
        return expect(async () => await createToken('')).rejects.toThrow('email is empty');
    });
    test('test createToken correct email', ()  => {
        return expect(createToken('mon.email@gmail.com')).not.toBeNull();
    });
    test('test createToken incorrect format', ()  => {
        return expect(createToken('mon.emailgmail.com')).rejects.toThrow('email is not valid');
    });
    test('test createToken incorrect format 2 ', ()  => {
        return expect(createToken('mon.email@gmailcom')).rejects.toThrow('email is not valid');
    });
    test('test createToken empty secretKey', ()  => {
        return expect(createToken('mon.email@gmailcom')).rejects.toThrow('email is not valid');
    });

    /**
     * Test function justifyText
     */
    


} )