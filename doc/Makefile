devel.html: devel.adoc
	a2x --verbose -f xhtml --icons devel.adoc

user.html: user.adoc
	a2x --verbose -f xhtml --icons -k user.adoc

README.asciidoc: ../README.rst
	pandoc -o $@ $<

index.html: README.asciidoc
	asciidoc -v -b html5 -f index.conf -o $@ $<
