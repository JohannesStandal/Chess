<h1>Preben - Chess engine</h1>

 _/|    
// o\   
|| ._)  
//__\   
)___( 

<p> Creator </p>
<ul>
  <li> Johannes Husevåg Standal </li>
</ul>

<h2>Project description<h2>
<p>
  Preben is a standard negamax chess engine written in JS and built as a console application 
  using Node.js. Following standard UCI protocol it will take on the bot community of lichess.org
</p>

<h2> Specifications </h2>
<p>
  Prebens Engine algorithm can be found in "core/Engine". It utilizies a virtual chessboard together with binary encrypted moves and pieces. 
  The algorithm is based on other implementations from the chess programming wiki. His core consists of a search and an evalutation scheme, in order
  to determine the best positions.
</p>
<h2>Search</h2>
<ul>
  <li> Negamax </li>
  <li> Quiesence search </li>
  <li> Alpha beta pruning </li>
  <li> Move ordering </li>
  <li> Transposition table </li>
  <li> Iterative deepening </li>
</ul>
<h2>Evaluation</h2>
<ul>
  <li> Material count </li>
  <li> Piece square tables </li>
  <li> Force king to corner (endgame) </li>
  <li> Close distance between kings (endgame) </li>
  <li> MVV_LVA (move ordering) </li>
  <li> Piece square tables (move ordering) </li>
</ul>
