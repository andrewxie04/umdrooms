import { create } from 'zustand';
export const useInteriorStore=create<{building:'IRB'|null;enter():void;exit():void}>(set=>({building:null,enter:()=>set({building:'IRB'}),exit:()=>set({building:null})}));
