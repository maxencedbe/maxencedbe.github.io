# Build both CV language versions and drop the PDFs straight into the site's
# public/ folder, with the exact names the Navbar links to. The CV uses xelatex
# (local Poppins fonts via fontspec), so pdflatex will not work here.
#
# Usage:
#   make        # build both, copy PDFs into ../public
#   make en     # English only
#   make fr     # French only
#   make clean  # remove LaTeX build artifacts (incl. the intermediate cv.pdf)

PUBLIC := ../public
LATEXMK := latexmk -xelatex -interaction=nonstopmode -halt-on-error

.PHONY: all en fr clean

all: en fr

en:
	cd en && $(LATEXMK) cv.tex
	cp en/cv.pdf $(PUBLIC)/Maxence_Debes_Resume_Ang.pdf

fr:
	cd fr && $(LATEXMK) cv.tex
	cp fr/cv.pdf $(PUBLIC)/Maxence_Debes_Resume_Fra.pdf

clean:
	cd en && latexmk -C
	cd fr && latexmk -C
