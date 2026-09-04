<pre>
        ,....,         ██████╗ ██████╗ ███████╗██████╗ ███████╗███╗   ██╗
      ,::::::<         ██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝████╗  ██║
     ,::/^\"``.        ██████╔╝██████╔╝█████╗  ██████╔╝█████╗  ██╔██╗ ██║
    ,::/, `   e`.      ██╔═══╝ ██╔══██╗██╔══╝  ██╔══██╗██╔══╝  ██║╚██╗██║
   ,::; |        '.    ██║     ██║  ██║███████╗██████╔╝███████╗██║ ╚████║
   ,::|  \___,-.  c)   ╚═╝     ╚═╝  ╚═╝╚══════╝╚═════╝ ╚══════╝╚═╝  ╚═══╝
   ;::|     \   '-'     
   ;::|      \               ██████╗██╗  ██╗███████╗███████╗ ███████╗
   ;::|   _.=`\             ██╔════╝██║  ██║██╔════╝██╔════╝ ██╔════╝
   `;:|.=` _.=`\            ██║     ███████║█████╗  ███████╗ ███████╗  
     '|_.=`   __\           ██║     ██╔══██║██╔══╝  ╚════██║ ╚════██║ 
     `\_..==`` /            ╚██████╗██║  ██║███████╗███████║ ███████║
      .'.___.-'.             ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝ ╚══════╝
     /          \
    ('--......--')                         
    /'--......--'\
    `"--......--"`
</pre>

<p> Author </p>
<ul>
  <li> Johannes Husevåg Standal </li>
</ul>

<h2>Project description</h2>

<p>
  Preben is a standard PVS (negamax) chess engine written in JS and built as a console application 
  using Node.js. Following standard UCI protocol it will take on the bot community of lichess.org. 
  The project is intended as a learning exercise and therefore everything is written from scratch with no
  libraries etc. The hood of the engine is located in Core/Engine. The movegen and chessboard code is also the Core folder. 

  Would you like to play the engine yourself? Challenge Preben on lichess: <a>https://lichess.org/@/Preben-Engine</a>

  not online? You can play against him locally in your browser, by running the Browser folder. 

</p>

<h2> Specifications </h2>
<p>
  Prebens Engine algorithm can be found in "core/Engine". It utilizies a simulated chessboard . 
  The algorithm is based on other implementations from the chess programming wiki. His core consists of a search and evaluation scheme, in order
  to determine the best positions.
</p>


<h2>Board </h2>
  <ul>
  <li> 8x8 Mailbox </li>
  <li> Piece lists</li>
  <li> Zobrist hashing</li>
</ul>

<h2>Search</h2>
<ul>
  <li> Opening Book </li>
  <li> Iterative deepening </li>
  <li> PVS (negamax) </li>
  <li> Quiesence search </li>
  <li> Alpha beta pruning </li>
  <li> Null Move Pruning</li>
  <li> Transposition table </li>
  <li> Search extensions (Checks and promotions)</li>
</ul>

<h2> Move ordering </h2>
<ul>
  <li> Previous Bestmove </li>
  <li> Hash Move </li>
  <li> Killer moves </li>
  <li> MVV-LVA (capture moves)  </li>
  <li> PST (quiet moves)</li>  
</ul>

<h2>Evaluation (Midgame and Endgame)</h2>

<ul>
  <li> Insufficient material </li>
  
  <li> Material count </li>
  <li> Piece Square Tables (MG & EG)</li>
  <li> Mop Up (winning EG) </li>

  <li> Passed pawn bonus </li>
  <li> Isolated pawn penalty </li>
  <li> Stacked pawns penalty </li>
  <li> Pawn Shields (MG) </li>
  <li> Virtual King Mobility (MG) </li>
  
  <li> Bishop pair</li>
  <li> Sliding piece mobility (MG) </li>
  <li> Trapped piece penalty (MG) </li>
</ul>
