import { writeFile } from 'node:fs/promises';
import xmlEscape from 'xml-escape';

async function main() {
    const baseUrl = `https://raw.githubusercontent.com/SAP-samples/btp-service-metadata/main/v0`;
    const results = [];
    try {
        const response = await fetch(`${baseUrl}/inventory.json`);
        const inventory = await response.json();
        // I know, a queue with concurrency would be much better. Next iteration maybe?
        for (const file of inventory) {
            const filename = `${baseUrl}/developer/${file.fileName}`;
            console.log(filename);
            const response = await fetch(filename);
            results.push(await response.json());
        }
        const mappedData = results.map(item => {
            const tags = `SAP,BTP,${item.name}`.split(',');
            const shape = {
                "url": item.icon,
                "data": item.icon,
                "w": 56,
                "h": 56,
                "title": xmlEscape(item.displayName),
                "aspect": "fixed",
                "tags": tags.map(tag => xmlEscape(tag))
            };
            let isUrl = new RegExp('^https?:\/\/');
            if (!isUrl.test(item.icon)) {
                shape.url = "";
            }
            return shape;
        });
        const payload = `<mxlibrary>\n${JSON.stringify(mappedData)}\n</mxlibrary>`;
        await writeFile('./libs/SAP_BTP_Service_Icons_latest_NEW.xml', payload);

    } catch (err) {
        console.error(err);
    }
}

main();
