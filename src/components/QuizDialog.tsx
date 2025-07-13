"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";

interface Quiz {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

interface QuizDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    quiz: Quiz;
    onQuizComplete: (passed: boolean) => void;
}

export function QuizDialog({ isOpen, onOpenChange, quiz, onQuizComplete }: QuizDialogProps) {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    useEffect(() => {
        // Reset state when the dialog is reopened for a new quiz
        if (isOpen) {
            setSelectedAnswer(null);
            setIsSubmitted(false);
            setIsCorrect(false);
        }
    }, [isOpen]);

    const handleSubmit = () => {
        if (!selectedAnswer) return;
        const correct = selectedAnswer === quiz.correctAnswer;
        setIsCorrect(correct);
        setIsSubmitted(true);
        if (correct) {
            onQuizComplete(true);
        }
    };

    const handleClose = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-headline">Test Your Knowledge</DialogTitle>
                    <DialogDescription>{quiz.question}</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <RadioGroup value={selectedAnswer ?? ""} onValueChange={setSelectedAnswer} disabled={isSubmitted}>
                        {quiz.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-3 py-2">
                                <RadioGroupItem value={option} id={`option-${index}`} />
                                <Label htmlFor={`option-${index}`} className="font-normal cursor-pointer">{option}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
                {isSubmitted && (
                    isCorrect ? (
                        <div className="mt-4 flex items-start gap-3 rounded-lg border border-accent/50 bg-accent/10 p-4 text-accent-foreground dark:text-accent">
                            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-accent" />
                            <div>
                                <h3 className="font-bold text-accent">Correct!</h3>
                                <p className="text-sm">Great job! You've mastered this concept.</p>
                            </div>
                        </div>
                    ) : (
                        <Alert variant="destructive" className="mt-4">
                            <XCircle className="h-4 w-4" />
                            <AlertTitle>Not Quite</AlertTitle>
                            <AlertDescription>{quiz.explanation}</AlertDescription>
                        </Alert>
                    )
                )}
                <DialogFooter>
                    {isSubmitted ? (
                        <Button onClick={handleClose}>Continue</Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={!selectedAnswer}>Submit</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
