
export type NgramData = Array<string>;

// Default set of characters using english letter frequency
const charSet = "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeetttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaoooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiinnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnsssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddlllllllllllllllllllllllllllllllllllllllllllllllllllllllluuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuccccccccccccccccccccccccccccccccccccccmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmffffffffffffffffffffffffffffffffyyyyyyyyyyyyyyyyyyyyyyyyyyyyyywwwwwwwwwwwwwwwwwwwwwwwwwwwwwggggggggggggggggggggggggggggpppppppppppppppppppppppppbbbbbbbbbbbbbbbbbbbbbvvvvvvvvvvvvvvvkkkkkkkkkxxqjz ";


export async function getNgramDataForKey(key: string): Promise<NgramData> {

    let result: NgramData = charSet.split("");
    const key_encoded = encodeURI(encodeURI(key)); // Double encode the key
    const url = `https://raw.githubusercontent.com/tito21/ngrams-blogger/refs/heads/main/ngrams/${key_encoded}.json`
    // const url = `https://storage.googleapis.com/avant-garbel-ngrams/ngrams/${key_encoded}.json`
    try {
        let response = await fetch(url);
        if (!response.ok) {
            console.log("Failed to fetch", url);
            return result;
        }
        else {
            let obj: any = await response.json();
            // console.log("Object", obj);
            return obj[key];
        }
    } catch (error) {
        console.error("Error", error);
        return result;
    }
}