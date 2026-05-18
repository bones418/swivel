# How does a turn work

## Phase 1 Moving
The player moves their colored token to an adjacent tile.  They can move one space up, down, left, right or diagonally to
a tile that is not occupied by another player's token.  If no valid move exists then the player is able to "move to" the
tile that they are currently on.

## Phase 2 Place a peg
After the Moving phase is complete, the player may place one peg on the tile that their token is on.  Valid peg placements are:
* Adding a peg of their color to a side that is currently empty
* Adding a peg to a side that currently contains only pegs of their color

If no valid move exists, then this phase is skipped.

## Phase 3 Rotate tile
After the Place a peg phase is complete, the player must choose to rotate the tile that their token is on.  Valid option are:
* Rotate counter-clockwise
* Rotate clockwise

### Battle
Battles happen after the rotation completes.  This phase works as follows:
* Suppose the tiles are numbered 1 to N.  Numbering starts at the top left and goes to the right. At the end of the row, numbering continues on the row below on the left hand again goes to the right.
* Let's say the board is 3x3 and the player is on tile 6
** The top side of tile 6 is compared to the bottom side of tile 3
*** If one of these sides contain colored pegs that are the color of the player who rotated the tile, and the other contains colored pegs for another player, then one of the following happens:
**** If the side containing pegs that are the color of the player who rotated the tile has equal or more pegs than the other side, and the side with fewer pegs is not "full" (where full is defined as all holes filled with pegs) then the side with fewer pegs loses a peg, and the side with equal or more pegs gains a peg unless it's already full
**** Alternatively, if the side containing pegs that are the color of the player who rotated the tile has less pegs than the other side, and the side with fewer pegs is not "full" (where full is defined as all holes filled with pegs) then the side with fewer pegs loses a peg, and the side with equal or more pegs gains a peg unless it's already full
** Next, the right hand side of tile 6 is checked.  In the case of a 3x3 board, there is no tile to the right of tile 6 so nothing happens
** Next, the bottom side of tile 6 is checked and compared to the top side of tile 9 which sits below it
** Finally, the left hand side of tile 6 is checked and compared to the right hand side of tile 5