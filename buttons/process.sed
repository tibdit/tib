#!/bin/sed -f


# iteratively prefix Adobe Illustrator st[0-9] classes with tib-btn-ai

# \( class=\)             	(class=)           	class=       	\1
# \(\(['" ].*[^'" ]\)*\) 	((['" ].*[^'" ])*) 	$chars[^$] * 	\2 \3
# \(['" ]\)    				(['" ])            	$            	\4
# \(st[0-9]\+\) 			(st\d+) 			stN 			\5
# \(['" ]\) 				(['" ]) 			$				\6

:ai_classes
s/\( class=\)\(\(['" ].*[^'" ]\)*\)\(['" ]\)\(st[0-9]\+\)\(['" ]\)/\1\3\4tib-btn-ai-\5\6/
t ai_classes


# if there is an id, move to class and merge in other classes

s/\( id="\)\(bd-[^'"]*\)['"]\(.* class=['"]\([^'"]*\)['"]\)\?/ class="\2 \4"/


# set <svg> element id
# remove height/width x/y style attributes from <svg> element
# include button name in tib-btn-[name]-ai-[st0]
