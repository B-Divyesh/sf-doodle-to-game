# Demo sandbox

Open `/?demo=1` or `/demo` for the one-click sample. It starts **Maya and
Theo’s Doodle dodge** with two original built-in drawings. The title, game,
Start round button, and touch pad are in the first phone screen.

The persistent banner says “Demo — sample data, nothing is saved.” **Reset
demo** restores the supplied drawings and rule. **Start for real** deletes the
demo record and goes to the empty personal workshop. Demo work uses the
`doodle-to-game-demo` IndexedDB database; real work uses `doodle-to-game`.
The two stores never share a record. Demo mode does not read, verify, restore,
or write the real Workshop Pack license keys. It previews the bonus inks and
finish celebration without saving an entitlement.
