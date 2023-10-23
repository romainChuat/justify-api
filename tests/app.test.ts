import { checkEmail, createToken } from '../src/app';
import { checkToken } from '../src/app';
import { createUser } from '../src/app';
import { checkWords } from '../src/app';
import { justifyText } from '../src/app';
import { data } from '../src/app';
const request = require('supertest');
const express = require('express');
import { app } from  '../src/app';




describe('test app file', () => {
    beforeEach(() => {

        let expiration = new Date();
        expiration.setTime(expiration.getTime() + 86400000);
        data.push({email: 'foo@bar.com', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZvb0BiYXIuY29tIiwiaWF0IjoxNjk3OTI3MDMwLCJleHAiOjE2OTgwMTM0MzB9.nhjAR55fCnzno2oaoqlaOsp6pEpsxRigSBDeyxosvxE', wordCount: 0, expirationDate: expiration});
        data.push({email: 'rchuat@bar.com', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJvbWFpbkBiYXIuY29tIiwiaWF0IjoxNjk3OTc3OTA3LCJleHAiOjE2OTgwNjQzMDd9.GBeZ8eoC3iidbvlvKAy0cRespbPiEPVR6oiQXPX-83M', wordCount: 0, expirationDate: expiration});
    });

    afterEach(() => {
        data.splice(0, data.length);
    });

    /**
     * Test checkToken
     */
    test('test checkToken existing token', () => {
        expect(checkToken(data[0].token)).toBe(true);
    });
    test('test checkToken unexisting token', () => {
        expect(checkToken('my_token')).toBe(false);
    });
    test('test checkToken empty token', () => {
        expect(checkToken('')).toBe(false);
    });



    /**
     * Test function createToken
     */

    test('test createToken empty email', () => {
        return expect(createToken('', '123456')).toBe('');
    });
    test('test createToken empty key', () => {
        return expect(createToken('foobar@gmail.com', '')).toBe('');
    });
    test('test createToken correct email correct token', () => {
        return expect(createToken('mon.email@gmail.com', '123456')).not.toBeNull();
    });

    /**
     * Test function checkEmail
     */
    test('test checkEmail correct email', () => {
        expect(checkEmail('foo@bar.com')).toBe(true);
    });
    test('test checkEmail empty email', () => {
        expect(checkEmail('')).toBe(false);
    });
    test('test checkEmail incorrect format', () => {
        expect(checkEmail('mon.emailgmail.com')).toBe(false);
    });
    test('test checkEmail incorrect format 2', () => {
        expect(checkEmail('mon.email@gmailcom')).toBe(false);
    });
    

    /**
     * Test createUser
     */

    test('test createUser correct email', () => {
        createUser('','');
        console.log(data);
        expect(data.length).toBe(2);
    });
    test('test createUser empty email', () => {
        createUser('','token_2');
        expect(data.length).toBe(2);
    });
    test('test createUser empty token', () => {
        createUser('foo2@bar.com','');
        expect(data.length).toBe(2);
    });

    test('test createUser existing email', () => {
        createUser('foo@bar.com','my_token1');
        expect(data.length).toBe(2);
        expect(data[0].token).toBe('my_token1');
        expect(data[0].email).toBe('foo@bar.com');
    });

    test('test createUser unexisting email', () => {
        createUser('foo1@bar.com','my_token1');
        expect(data.length).toBe(3);
        expect(data[2].token).toBe('my_token1');
        expect(data[2].email).toBe('foo1@bar.com');
    });
    
    /**
     * Test checkWords
     */

    test('test checkWords correct token', () => {
        let text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
        let remainingWords = checkWords(data[0].token, text);
        expect(remainingWords).toBe(80000 - text.split(' ').length + 1);
        expect(data[0].wordCount).toBe(text.split(' ').length-1);
    });
    test('test checkWords incorrect token', () => {
        expect(checkWords('my_token', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.')).toBe(0);
    });
    test('test checkWords empty token', () => {
        expect(checkWords('', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.')).toBe(-1);
    });
    test('test checkWords empty text', () => {
        expect(checkWords(data[0].token, '')).toBe(80000);
    });

    test('test checkWords correct token but too many words', () => {
        data[0].wordCount = 79990;
        let text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
        expect(checkWords(data[0].token, text)).toBe(0);
        expect(data[0].wordCount).toBe(79990);
    });
    
    test('test checkWords correct token but too many words', () => {
        data[0].wordCount = 0;
        let text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
        while(text.split(' ').length < 80000) {
            text += ' Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
        }
        //expect(checkWords(data[0].token, text)).toBe(0);
        expect(data[0].wordCount).toBe(0);
    });

    test('test checkWords day after', () => {
        data[0].expirationDate.setTime(data[0].expirationDate.getTime() - 1086400000);
        data[0].wordCount = 79990;
        let text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
        expect(checkWords(data[0].token, text)).toBe(80000 - text.split(' ').length + 1);
    });


    /**
     * Test function justifyText
     */

    test('test justifyText correct token', () => {
        let text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
        let words = text.split(' ').length-1;
        let justified = justifyText(text, 80, 0);
        let lines = justified.split('\n');
        console.log(lines);
        for(let i = 2; i < lines.length; i++){
            if(i != lines.length-1){
                expect(lines[i].length).toBe(80);
            }
        }
    });

    test('test justifyText long text', () => {
        let text = `Longtemps, je me suis couché de bonne heure. Parfois, à peine ma bougie éteinte, 
                    mes yeux se fermaient si vite que je n’avais pas le temps de me dire: «Je m’endors.» 
                    Et, une demi-heure après, la pensée qu’il était temps de chercher le sommeil m’éveillait; 
                    je voulais poser le volume que je croyais avoir dans les mains et souffler ma lumière; 
                    je n’avais pas cessé en dormant de faire des réflexions sur ce que je venais de lire,
                     mais ces réflexions avaient pris un tour un peu particulier; 
                     il me semblait que j’étais moi-même ce dont parlait l’ouvrage: 
                     une église, un quatuor, la rivalité de François Ier et de Charles-Quint. 

                    Cette croyance survivait pendant quelques secondes à mon réveil; 
                    elle ne choquait pas ma raison, 
                    mais pesait comme des écailles sur mes yeux et les empêchait de se rendre compte que le bougeoir 
                    n’était plus allumé. 
                    Puis elle commençait à me devenir inintelligible, 
                    comme après la métempsycose les pensées d’une existence antérieure; le sujet du livre se détachait de moi,
                    j’étais libre de m’y appliquer ou non;
                    aussitôt je recouvrais la vue et j’étais bien étonné de trouver autour de moi une obscurité, 
                    douce et reposante pour mes yeux, mais peut-être plus encore pour mon esprit, 
                    à qui elle apparaissait comme une chose sans cause, incompréhensible, 
                      comme une chose vraiment obscure. Je me demandais quelle heure il pouvait être; 
                      j’entendais le sifflement des trains qui, plus ou moins éloigné, 
                      comme le chant d’un oiseau dans une forêt, relevant les distances, 
                      me décrivait l’étendue de la campagne déserte où le voyageur se hâte vers la station prochaine; 
                      et le petit chemin qu’il suit va être gravé dans son souvenir par l’excitation qu’il doit à des
                       lieux nouveaux, à des actes inaccoutumés, à la causerie récente et aux adieux sous la
                        lampe étrangère qui le suivent encore dans le silence de la nuit, à la douceur prochaine du retour.
        `;
        let words = text.split(' ').length-1;
        let justified = justifyText(text, 80, 0);
        let lines = justified.split('\n');
        console.log(lines);
        for(let i = 2; i < lines.length; i++){
            if(i != lines.length-1){
                expect(lines[i].length).toBe(80);
            }
        }
    });


});

describe('test api creatToken', () => {
    test('test api createToken valid email', async () => {
        const email = 'foo@bar.com'; 
    
        const response = await request(app).post('/api/token').send({ email });
    
        // Vérifie que la réponse a un statut HTTP 200 (OK)
        expect(response.status).toBe(200);
    
        expect(response.body.token).toBeDefined();
    });
    test('test api  createToken unvalid email', async () => {
        const email = 'foo@barcom'; 
    
        const response = await request(app).post('/api/token').send({ email });
    
        // Vérifie que la réponse a un statut HTTP 200 (OK)
        expect(response.status).toBe(200);
    
        expect(response.body.token).toBeDefined();
    });

});