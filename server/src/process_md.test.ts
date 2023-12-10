import { TestEnvironment } from './test_environment'
import { processContents } from "./process_md";
import fs from "fs/promises"
import path from "path"

const testtext = `
# Header

## Subheader

Simple text

      code block
      code line 2

simple text

~~~javascript
const test = "test";
~~~
`

const expected = `<h1>Header</h1>
<h2>Subheader</h2>
<p>Simple text</p>
<pre><code>  code block
  code line 2
</code></pre><p>simple text</p>
<pre><code class="hljs language-javascript"><span class="hljs-keyword">const</span> test = <span class="hljs-string">&quot;test&quot;</span>;
</code></pre>`.replace(/[\n\r]/g, "")

describe("process markdown", () => {
  let te: TestEnvironment
  beforeAll(async () => {
    te = new TestEnvironment()
    await te.setup()
  })
  afterAll(async () => {
    await te.teardown()
  })

  it("should expand code fences", async () => {
    const processed = await processContents("The following dash should be expanded\n-javascript\n-\nbut not this - end")
    expect(processed).toEqual(`<p>The following dash should be expanded</p>\n<pre><code class="hljs language-javascript">\n</code></pre><p>but not this - end</p>\n`)

  })
  it("should return html", async () => {
    const processed = await processContents(testtext)
    expect(processed.replace(/[\n\r]/g, "")).toEqual(expected)

  })

  it("should process a partial", async () => {
    const partial = "<div>This is a [[title]]</div>"
    await fs.writeFile(path.join(process.env.partials, "test.html"), partial)
    const text = `Replace the following: [[{"template":"test","title":"partial"}]] with the template`
    const processed = await processContents(text)
    expect(processed.trim()).toEqual("<p>Replace the following: <div>This is a partial</div> with the template</p>")
  })

})
